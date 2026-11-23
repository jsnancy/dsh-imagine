// Codex / ChatGPT 订阅账号：读登录信息、读额度、调内置生图接口。
// 额度走 `codex app-server` 的 JSON-RPC（account/rateLimits/read），生图走 ChatGPT 后端接口。
import { spawn } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import { delimiter, isAbsolute, join } from 'node:path'
import { createInterface } from 'node:readline'
import { codexAuthFile, codexHome } from './paths.js'
import { request, proxyUrl } from './net.js'

const IMAGE_ENDPOINT = 'https://chatgpt.com/backend-api/codex/images/generations'
const CLIENT_INFO = { name: 'dsh-image-studio', version: '0.1.0', title: 'Image Studio' }

export class CodexError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'CodexError'
    this.code = code
    if (details) Object.assign(this, { details })
  }
}

/** 可执行文件的候选位置（按优先级）。 */
function binaryCandidates() {
  const home = process.env.HOME || ''
  const list = []
  if (home) {
    list.push(join(home, '.local/bin/codex'))
    list.push(join(home, '.bun/bin/codex'))
    list.push(join(home, '.volta/bin/codex'))
    list.push(join(home, '.npm-global/bin/codex'))
    list.push(join(home, 'Library/pnpm/codex'))
  }
  if (process.platform === 'darwin') {
    list.push('/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex')
    list.push('/Applications/Codex.app/Contents/MacOS/codex')
    list.push('/opt/homebrew/bin/codex')
    list.push('/usr/local/bin/codex')
  } else if (process.platform === 'win32') {
    if (process.env.LOCALAPPDATA) {
      list.push(join(process.env.LOCALAPPDATA, 'Programs/codex/codex.exe'))
      list.push(join(process.env.LOCALAPPDATA, 'ChatGPT/codex-cli/codex.exe'))
    }
    if (process.env.APPDATA) list.push(join(process.env.APPDATA, 'npm/codex.cmd'))
  } else {
    list.push('/usr/local/bin/codex')
    list.push('/usr/bin/codex')
    list.push('/snap/bin/codex')
  }
  const pathEntries = (process.env.PATH || '').split(delimiter).filter(Boolean)
  const suffixes = process.platform === 'win32' ? ['codex.cmd', 'codex.exe', 'codex'] : ['codex']
  for (const dir of pathEntries) {
    for (const name of suffixes) list.push(join(dir, name))
  }
  return list
}

function isFile(path) {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

/** 找 codex 可执行文件；找不到返回 null。 */
export function findCodexBinary(configured) {
  const wanted = typeof configured === 'string' ? configured.trim() : ''
  if (wanted) {
    const path = isAbsolute(wanted) ? wanted : wanted
    if (isFile(path)) return path
    throw new CodexError('codex-missing', `设置里的 Codex 路径不存在：${wanted}`)
  }
  const fromEnv = typeof process.env.CODEX_BIN === 'string' ? process.env.CODEX_BIN.trim() : ''
  if (fromEnv && isFile(fromEnv)) return fromEnv
  for (const candidate of binaryCandidates()) {
    if (isFile(candidate)) return candidate
  }
  return null
}

function decodeJwt(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** 读本机 Codex 登录信息（不联网）。 */
export async function readAccount() {
  const file = codexAuthFile()
  let raw
  try {
    raw = JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return {
      ok: false,
      reason: 'missing',
      hint: '没找到 Codex 登录信息，先在终端里运行一次 `codex login`。',
      authPath: file,
    }
  }
  const tokens = raw && raw.tokens ? raw.tokens : {}
  const accessPayload = decodeJwt(tokens.access_token)
  const idPayload = decodeJwt(tokens.id_token)
  if (!tokens.access_token) {
    return {
      ok: false,
      reason: 'no-token',
      hint: currentAuthHint(raw),
      authPath: file,
      authMode: raw.auth_mode || null,
    }
  }
  const authClaim = (accessPayload && accessPayload['https://api.openai.com/auth']) || {}
  const expiresAt = accessPayload && accessPayload.exp ? accessPayload.exp * 1000 : null
  return {
    ok: true,
    authMode: raw.auth_mode || null,
    authPath: file,
    codexHome: codexHome(),
    email: (idPayload && idPayload.email) || null,
    name: (idPayload && idPayload.name) || null,
    plan: authClaim.chatgpt_plan_type || null,
    accountId: tokens.account_id || authClaim.chatgpt_account_id || null,
    expiresAt,
    issuedAt: accessPayload && accessPayload.iat ? accessPayload.iat * 1000 : null,
    lastRefresh: raw.last_refresh || null,
    hasRefreshToken: Boolean(tokens.refresh_token),
  }
}

function currentAuthHint(raw) {
  if (raw && raw.auth_mode === 'apikey') {
    return '当前 Codex 用的是 API key 登录，本插件需要 ChatGPT 订阅登录：运行 `codex login` 选 ChatGPT 账号。'
  }
  return '登录信息里没有可用的访问令牌，运行 `codex login` 重新登录。'
}

/** 小工具：等 promise 但带超时。 */
function withTimeout(promise, ms, onTimeout) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(onTimeout()), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function quotaEnv(url) {
  const env = { ...process.env }
  if (url) {
    for (const key of ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy']) env[key] = url
    env.NO_PROXY = ''
    env.no_proxy = ''
  }
  return env
}

/**
 * spawn `codex app-server`，走 JSON-RPC 读额度。
 * 返回原始的 GetAccountRateLimitsResponse。
 */
export async function readRateLimits({ binary, proxy, timeoutMs = 45000 } = {}) {
  const bin = binary || findCodexBinary('')
  if (!bin) {
    throw new CodexError(
      'codex-missing',
      '没找到 codex 可执行文件：装好 Codex CLI 或 ChatGPT 桌面版后重试，也可以在设置里填 codex 的绝对路径。',
    )
  }
  const env = quotaEnv(proxyUrl(proxy))
  return new Promise((resolve, reject) => {
    let child
    try {
      child = spawn(bin, ['app-server'], { stdio: ['pipe', 'pipe', 'pipe'], env, cwd: codexHome() })
    } catch (err) {
      reject(new CodexError('codex-spawn', `启动 codex 失败：${err.message}`, err))
      return
    }
    const pending = new Map()
    let nextId = 1
    let settled = false
    const timer = setTimeout(() => {
      finish(new CodexError('codex-timeout', '读额度超时：codex app-server 没有在限定时间内返回。'))
    }, timeoutMs)

    const stderrChunks = []
    const finish = (err, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        child.stdin.end()
      } catch {}
      try {
        child.kill('SIGKILL')
      } catch {}
      if (err) reject(err)
      else resolve(value)
    }

    const send = (payload) => {
      try {
        child.stdin.write(`${JSON.stringify(payload)}\n`)
      } catch (err) {
        finish(new CodexError('codex-io', `和 codex 通信失败：${err.message}`, err))
      }
    }
    const call = (method, params) =>
      new Promise((res, rej) => {
        const id = nextId++
        pending.set(id, { resolve: res, reject: rej })
        send({ id, method, params })
      })

    child.on('error', (err) => {
      finish(new CodexError('codex-spawn', `启动 codex 失败：${err.code === 'ENOENT' ? `找不到 ${bin}` : err.message}`, err))
    })
    child.stderr.on('data', (chunk) => {
      if (stderrChunks.length < 40) stderrChunks.push(chunk.toString('utf8'))
    })
    child.on('exit', (code) => {
      if (settled) return
      const detail = stderrChunks.join('').trim().split('\n').slice(-4).join(' | ')
      finish(
        new CodexError(
          'codex-exit',
          `codex app-server 提前退出（code ${code}）${detail ? `：${detail}` : ''}`,
        ),
      )
    })

    const rl = createInterface({ input: child.stdout })
    rl.on('line', (line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed[0] !== '{') return // 跳过日志行
      let message
      try {
        message = JSON.parse(trimmed)
      } catch {
        return
      }
      if (message.id != null && message.method == null) {
        const waiter = pending.get(message.id)
        if (!waiter) return
        pending.delete(message.id)
        if (message.error) waiter.reject(new CodexError('codex-rpc', message.error.message || 'codex 返回错误', message.error))
        else waiter.resolve(message.result)
      }
    })

    ;(async () => {
      await call('initialize', { clientInfo: CLIENT_INFO })
      send({ method: 'initialized' })
      const result = await call('account/rateLimits/read', {})
      finish(null, result)
    })().catch((err) => {
      if (err instanceof CodexError) finish(err)
      else finish(new CodexError('codex-rpc', `读额度失败：${err && err.message ? err.message : String(err)}`, err))
    })
  })
}

function isoFromSeconds(seconds) {
  const ms = Number(seconds)
  if (!Number.isFinite(ms) || ms <= 0) return null
  return new Date(ms * 1000).toISOString()
}

/** 把 app-server 的原始额度结构整理成前端好用的形状。 */
export function summarizeQuota(raw, { binary } = {}) {
  const byId = raw && typeof raw === 'object' ? raw.rateLimitsByLimitId || null : null
  const snapshot = (byId && (byId.codex || Object.values(byId)[0])) || (raw && raw.rateLimits) || null
  const windows = []
  if (snapshot) {
    for (const key of ['primary', 'secondary']) {
      const window = snapshot[key]
      if (!window || typeof window !== 'object') continue
      const usedPercent = Number(window.usedPercent)
      windows.push({
        kind: key,
        usedPercent: Number.isFinite(usedPercent) ? Math.max(0, Math.min(100, usedPercent)) : null,
        windowMinutes: Number(window.windowDurationMins) || null,
        resetsAt: isoFromSeconds(window.resetsAt),
      })
    }
  }
  const credits = snapshot && snapshot.credits ? snapshot.credits : null
  const resetCredits = raw && raw.rateLimitResetCredits ? raw.rateLimitResetCredits : null
  return {
    provider: 'codex',
    fetchedAt: Date.now(),
    binary: binary || null,
    limitId: snapshot ? snapshot.limitId || null : null,
    plan: snapshot ? snapshot.planType || null : null,
    windows,
    credits: credits
      ? { hasCredits: Boolean(credits.hasCredits), unlimited: Boolean(credits.unlimited), balance: credits.balance ?? null }
      : null,
    spendControlReached: Boolean(snapshot && snapshot.spendControlReached),
    ordinaryUsageAllowed: raw && typeof raw.ordinaryUsageAllowed === 'boolean' ? raw.ordinaryUsageAllowed : null,
    resetCredits: resetCredits
      ? {
          availableCount: Number(resetCredits.availableCount) || 0,
          nextExpiresAt: Array.isArray(resetCredits.credits) && resetCredits.credits.length
            ? isoFromSeconds(resetCredits.credits[0].expiresAt)
            : null,
        }
      : null,
  }
}

/**
 * 用 ChatGPT 订阅额度生成一张图。
 * @returns {Promise<{buffer:Buffer, size:string|null, quality:string|null, background:string|null, usage:object|null, generationId:string|null}>}
 */
export async function generateImage({ prompt, size, background, proxy, timeoutMs = 240000 } = {}) {
  const text = typeof prompt === 'string' ? prompt.trim() : ''
  if (!text) throw new CodexError('prompt-empty', '提示词不能为空。')
  const account = await readAccount()
  if (!account.ok) throw new CodexError('codex-auth', account.hint || 'Codex 未登录。')
  const token = await fs
    .readFile(account.authPath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then((json) => (json && json.tokens ? json.tokens.access_token : null))
    .catch(() => null)
  if (!token) throw new CodexError('codex-auth', '读不到 Codex 访问令牌，运行 `codex login` 重新登录。')

  const body = { prompt: text }
  if (size && size !== 'auto') body.size = size
  if (background === 'transparent') body.background = 'transparent'

  const headers = {
    authorization: `Bearer ${token}`,
    'chatgpt-account-id': account.accountId || '',
    origin: 'https://chatgpt.com',
    referer: 'https://chatgpt.com/',
    'content-type': 'application/json',
    accept: 'application/json',
  }

  const startedAt = Date.now()
  let res
  try {
    res = await request(IMAGE_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      proxy,
      timeoutMs,
    })
  } catch (err) {
    if (err && err.code === 'connect-timeout') {
      throw new CodexError('network', '连不上 chatgpt.com：这台机器访问它需要代理，检查代理设置后再试。', err)
    }
    throw err
  }

  if (res.status === 401) {
    throw new CodexError('codex-auth-expired', 'Codex 的访问令牌已过期，运行 `codex login` 重新登录后再试。')
  }
  if (res.status === 429) {
    throw new CodexError('quota', '额度用尽或被限流了（HTTP 429），等额度重置或换账号再试。')
  }
  if (res.status < 200 || res.status >= 300) {
    const detail = (res.json && (res.json.detail || res.json.error?.message || res.json.message)) || res.text.slice(0, 300)
    throw new CodexError('image-api', `生图接口返回 HTTP ${res.status}：${detail}`)
  }
  const json = res.json
  const item = json && Array.isArray(json.data) ? json.data[0] : null
  if (!item || typeof item.b64_json !== 'string' || !item.b64_json) {
    throw new CodexError('image-api', '生图接口没有返回图片数据。')
  }
  const buffer = Buffer.from(item.b64_json, 'base64')
  if (buffer.length < 512) throw new CodexError('image-api', '生图接口返回的图片数据不完整。')
  return {
    buffer,
    size: json.size || null,
    quality: json.quality || null,
    background: json.background || null,
    outputFormat: json.output_format || null,
    usage: json.usage || null,
    generationId: item.generation_id || null,
    elapsedMs: Date.now() - startedAt,
  }
}

export { IMAGE_ENDPOINT, existsSync }
