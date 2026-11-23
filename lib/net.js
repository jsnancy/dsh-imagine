// 最小 HTTPS 客户端。Node 20 的全局 fetch 不认 HTTPS_PROXY，所以这里自己开 TLS 连接，
// 需要时代理走 HTTP CONNECT 隧道：TCP 连代理 → CONNECT host:port → 在隧道上做 TLS。
import net from 'node:net'
import tls from 'node:tls'
import { URL } from 'node:url'

// 常见本地代理端口：Clash / Clash Verge / Surge / V2Ray / Shadowsocks 的默认值。
const LOCAL_PROXY_PORTS = [7890, 7897, 7891, 1087, 1080, 6152, 6153, 8118, 8888, 8889, 10808, 10809, 20171, 33210]
const MAX_RESPONSE_BYTES = 64 * 1024 * 1024
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const DETECT_TTL_MS = 5 * 60 * 1000

export class NetError extends Error {
  constructor(code, message, cause) {
    super(message)
    this.name = 'NetError'
    this.code = code
    if (cause) this.cause = cause
  }
}

/** 把用户填的代理值解析成 { host, port }；'off'/'none'/'direct'/空 → null。 */
export function normalizeProxy(value) {
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw || /^(off|none|direct|false|no)$/i.test(raw)) return null
  let url
  try {
    url = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? new URL(raw) : new URL(`http://${raw}`)
  } catch {
    throw new NetError('proxy-invalid', `代理地址看不懂：${raw}（示例：127.0.0.1:7890）`)
  }
  if (/^socks/i.test(url.protocol)) {
    throw new NetError('proxy-scheme', `不支持 SOCKS 代理（${raw}），请填同一客户端上的 HTTP 端口，例如 127.0.0.1:7890`)
  }
  const port = Number(url.port)
  if (!url.hostname || !Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new NetError('proxy-invalid', `代理地址缺少端口：${raw}（示例：127.0.0.1:7890）`)
  }
  return { host: url.hostname, port, label: `${url.hostname}:${port}` }
}

/** 代理对象的 http:// 形式，用于给子进程设环境变量。 */
export function proxyUrl(proxy) {
  return proxy ? `http://${proxy.host}:${proxy.port}` : null
}

export function proxyFromEnv() {
  const raw =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  if (!raw) return null
  try {
    return normalizeProxy(raw)
  } catch {
    return null
  }
}

function probeTcp(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    let settled = false
    const socket = net.connect({ host, port })
    const done = (ok) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(ok)
    }
    socket.setTimeout(timeoutMs, () => done(false))
    socket.once('connect', () => done(true))
    socket.once('error', () => done(false))
  })
}

let detectCache = { at: 0, proxy: null }

/** 探测本机常见端口上的 HTTP 代理；结果缓存 5 分钟。 */
export async function detectLocalProxy({ force = false } = {}) {
  if (!force && Date.now() - detectCache.at < DETECT_TTL_MS) return detectCache.proxy
  for (const port of LOCAL_PROXY_PORTS) {
    if (await probeTcp('127.0.0.1', port)) {
      detectCache = { at: Date.now(), proxy: { host: '127.0.0.1', port, label: `127.0.0.1:${port}` } }
      return detectCache.proxy
    }
  }
  detectCache = { at: Date.now(), proxy: null }
  return null
}

/** 忘掉自动探测的结果（连不上时调用，下次重新探）。 */
export function forgetDetectedProxy() {
  detectCache = { at: 0, proxy: null }
}

/**
 * 决定这次请求用哪个代理。
 * configured: 'auto'（默认，先环境变量再本机探测）/ 'off' / '127.0.0.1:7890'
 */
export async function resolveProxy(configured) {
  const value = typeof configured === 'string' ? configured.trim() : ''
  if (/^(off|none|direct|false|no)$/i.test(value)) return { proxy: null, source: 'off' }
  if (value && !/^auto$/i.test(value)) return { proxy: normalizeProxy(value), source: 'settings' }
  const env = proxyFromEnv()
  if (env) return { proxy: env, source: 'env' }
  const found = await detectLocalProxy()
  return { proxy: found, source: found ? 'detect' : 'direct' }
}

function connectTlsDirect(host, port, deadline) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, servername: host, ALPNProtocols: ['http/1.1'], timeout: Math.max(1000, deadline - Date.now()) },
      () => {
        socket.setTimeout(0)
        resolve(socket)
      },
    )
    socket.once('timeout', () => {
      socket.destroy()
      reject(new NetError('connect-timeout', `连接 ${host} 超时，可能需要代理`))
    })
    socket.once('error', (err) => {
      reject(new NetError('connect', `连不上 ${host}:${port}（${err.code || err.message}）`, err))
    })
  })
}

function connectTlsThroughProxy(proxy, host, port, deadline) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxy.host, port: proxy.port })
    let buffer = ''
    let settled = false
    const fail = (err) => {
      if (settled) return
      settled = true
      socket.destroy()
      reject(err)
    }
    socket.setTimeout(Math.max(1000, deadline - Date.now()), () => {
      fail(new NetError('proxy-timeout', `连不上代理 ${proxy.label}（超时），检查代理是否在运行`))
    })
    socket.once('error', (err) => {
      fail(new NetError('proxy-connect', `连不上代理 ${proxy.label}（${err.code || err.message}）`, err))
    })
    socket.once('connect', () => {
      socket.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`)
    })
    const onData = (chunk) => {
      buffer += chunk.toString('latin1')
      const end = buffer.indexOf('\r\n\r\n')
      if (end < 0) {
        if (buffer.length > 16384) fail(new NetError('proxy-handshake', `代理 ${proxy.label} 握手响应异常`))
        return
      }
      socket.removeListener('data', onData)
      socket.setTimeout(0)
      const statusLine = buffer.slice(0, buffer.indexOf('\r\n'))
      const code = Number(statusLine.split(' ')[1])
      if (code !== 200) {
        fail(new NetError('proxy-connect', `代理 ${proxy.label} 拒绝连接 ${host}:${port}（${statusLine.trim()}）`))
        return
      }
      let tlsSocket
      try {
        tlsSocket = tls.connect({ socket, servername: host }, () => {
          if (settled) return
          settled = true
          tlsSocket.setTimeout(0)
          resolve(tlsSocket)
        })
      } catch (err) {
        fail(new NetError('tls', `TLS 握手失败：${err.message}`, err))
        return
      }
      tlsSocket.once('error', (err) => fail(new NetError('tls', `TLS 握手失败：${err.code || err.message}`, err)))
    }
    socket.on('data', onData)
  })
}

function connectTls(proxy, host, port, deadline) {
  if (proxy && proxy.host) return connectTlsThroughProxy(proxy, host, port, deadline)
  return connectTlsDirect(host, port, deadline)
}

function decodeChunked(buf) {
  const parts = []
  let i = 0
  while (i < buf.length) {
    const lineEnd = buf.indexOf('\r\n', i)
    if (lineEnd < 0) break
    const size = parseInt(buf.subarray(i, lineEnd).toString('latin1').split(';')[0].trim(), 16)
    if (!Number.isFinite(size) || size < 0) break
    i = lineEnd + 2
    if (size === 0) break
    parts.push(buf.subarray(i, Math.min(i + size, buf.length)))
    i += size + 2
  }
  return Buffer.concat(parts)
}

function parseResponse(raw) {
  if (!raw.length) throw new NetError('empty', '服务器没有返回内容')
  const headerEnd = raw.indexOf('\r\n\r\n')
  if (headerEnd < 0) throw new NetError('malformed', '服务器返回的响应头不完整')
  const lines = raw.subarray(0, headerEnd).toString('latin1').split('\r\n')
  const statusLine = lines.shift() || ''
  const status = Number(statusLine.split(' ')[1])
  const headers = {}
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx > 0) headers[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim()
  }
  let body = raw.subarray(headerEnd + 4)
  if (/chunked/i.test(headers['transfer-encoding'] || '')) body = decodeChunked(body)
  else if (headers['content-length']) {
    const len = Number(headers['content-length'])
    if (Number.isFinite(len) && len >= 0 && len <= body.length) body = body.subarray(0, len)
  }
  const text = body.toString('utf8')
  let json = null
  if (text && /json/i.test(headers['content-type'] || '')) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }
  return { status, headers, body, text, json }
}

function readSocket(socket, maxBytes, deadline) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    let settled = false
    const finish = (fn, arg) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      socket.removeAllListeners('data')
      socket.removeAllListeners('error')
      socket.removeAllListeners('end')
      socket.removeAllListeners('close')
      fn(arg)
    }
    const timer = setTimeout(() => {
      socket.destroy()
      finish(reject, new NetError('timeout', '等服务器响应超时'))
    }, Math.max(1000, deadline - Date.now()))
    socket.on('data', (chunk) => {
      chunks.push(chunk)
      total += chunk.length
      if (total > maxBytes) {
        socket.destroy()
        finish(reject, new NetError('too-large', '返回内容过大'))
      }
    })
    socket.once('end', () => finish(resolve, Buffer.concat(chunks)))
    socket.once('error', (err) => finish(reject, new NetError('socket', `连接出错：${err.code || err.message}`, err)))
    socket.once('close', () => finish(resolve, Buffer.concat(chunks)))
  })
}

/**
 * 发一个 HTTPS 请求（可经 HTTP 代理）。
 * @returns {Promise<{status:number, headers:object, body:Buffer, text:string, json:any}>}
 */
export async function request(target, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    proxy = null,
    timeoutMs = 120000,
    maxBytes = MAX_RESPONSE_BYTES,
  } = options
  let url
  try {
    url = new URL(target)
  } catch {
    throw new NetError('url', `请求地址不合法：${target}`)
  }
  if (url.protocol !== 'https:') throw new NetError('protocol', '只支持 https 请求')
  const host = url.hostname
  const port = Number(url.port || 443)
  const deadline = Date.now() + timeoutMs
  const socket = await connectTls(proxy, host, port, deadline)
  try {
    const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8')
    const lines = [
      `${method} ${url.pathname}${url.search || ''} HTTP/1.1`,
      `Host: ${url.host}`,
      'Connection: close',
      `Accept-Encoding: identity`,
      `User-Agent: ${headers['user-agent'] || USER_AGENT}`,
    ]
    const skip = new Set(['user-agent', 'host', 'connection', 'content-length', 'accept-encoding'])
    for (const [key, value] of Object.entries(headers)) {
      if (value == null || skip.has(key.toLowerCase())) continue
      lines.push(`${key}: ${value}`)
    }
    if (payload) lines.push(`Content-Length: ${payload.length}`)
    const head = Buffer.from(`${lines.join('\r\n')}\r\n\r\n`, 'latin1')
    socket.write(payload ? Buffer.concat([head, payload]) : head)
    const raw = await readSocket(socket, maxBytes, deadline)
    return parseResponse(raw)
  } finally {
    socket.destroy()
  }
}

/** 请求 JSON 接口，非 2xx 时抛 NetError。 */
export async function requestJson(target, options = {}) {
  const res = await request(target, options)
  if (res.status < 200 || res.status >= 300) {
    const detail = res.text && res.text.length < 400 ? `：${res.text.replace(/\s+/g, ' ').trim()}` : ''
    throw new NetError('http', `接口返回 HTTP ${res.status}${detail}`)
  }
  if (!res.json) throw new NetError('json', '接口返回的不是 JSON')
  return res.json
}
