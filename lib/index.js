// 生图工坊 · 宿主半边
//   - 把 ChatGPT 订阅额度暴露成一组本地 HTTP 接口给面板用（/image-studio/api/*）
//   - 生成结果落在 $DSH_HOME/image-studio/images，经 /image-studio/media/<id>.<ext> 回给界面
//   - 给对话侧留两个工具：image_studio_generate / image_studio_quota
import { createReadStream, promises as fs } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listImages, readSettings, writeSettings, saveImage, findImage, removeImage } from './store.js'
import { listProviders, getAdapter, getQuota, clearQuotaCache } from './providers.js'
import { dataDir } from './paths.js'

export const name = 'image-studio'
export const inject = ['webServer', 'tools']

const BASE = '/image-studio'
const VERSION = '0.1.0'
const MAX_JSON_BODY = 32 * 1024

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }
const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const ICON_FILE = join(PKG_ROOT, 'icon.png')

function json(res, status, payload) {
  const text = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  })
  res.end(text)
}

function fail(res, status, code, message) {
  json(res, status, { ok: false, error: { code, message } })
}

async function readJsonBody(req, max = MAX_JSON_BODY) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > max) {
      req.destroy()
      throw Object.assign(new Error('请求内容过大'), { statusCode: 413 })
    }
    chunks.push(chunk)
  }
  if (!total) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  try {
    const value = JSON.parse(text)
    return value && typeof value === 'object' ? value : {}
  } catch {
    throw Object.assign(new Error('请求内容不是合法 JSON'), { statusCode: 400 })
  }
}

/** 只接受同源 POST（面板自己发的）。 */
function sameOrigin(req) {
  const origin = req.headers.origin
  const host = req.headers.host
  if (!origin) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function describeError(err) {
  if (!err) return { code: 'unknown', message: '未知错误' }
  const code = typeof err.code === 'string' ? err.code : 'error'
  const message = typeof err.message === 'string' && err.message ? err.message : String(err)
  return { code, message }
}

function toImagePayload(entry) {
  return {
    id: entry.id,
    url: `${BASE}/media/${entry.file}`,
    mediaType: entry.mediaType,
    bytes: entry.bytes,
    width: entry.width,
    height: entry.height,
    prompt: entry.prompt,
    provider: entry.provider,
    size: entry.size,
    background: entry.background,
    quality: entry.quality,
    elapsedMs: entry.elapsedMs,
    createdAt: entry.createdAt,
  }
}

function revealInFolder(path) {
  const target = path
  let command
  let args
  if (process.platform === 'darwin') {
    command = 'open'
    args = ['-R', target]
  } else if (process.platform === 'win32') {
    command = 'explorer'
    args = [`/select,${target}`]
  } else {
    command = 'xdg-open'
    args = [dirname(target)]
  }
  try {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' })
    child.on('error', () => {})
    child.unref()
    return true
  } catch {
    return false
  }
}

async function handleStatus(req, res) {
  const settings = await readSettings()
  const adapter = getAdapter(settings.provider)
  const account = await adapter.account()
  let quota = null
  let quotaError = null
  try {
    quota = await getQuota()
  } catch (err) {
    quotaError = describeError(err)
  }
  // 额度读失败不影响面板可用（图片历史、设置都还能看）
  json(res, 200, {
    ok: true,
    version: VERSION,
    provider: settings.provider,
    providers: listProviders(),
    account,
    quota,
    quotaError,
    settings,
    dataDir: dataDir(),
  })
}

async function handleQuota(req, res) {
  clearQuotaCache()
  const quota = await getQuota({ force: true })
  json(res, 200, { ok: true, quota })
}

async function handleGenerate(req, res) {
  const body = await readJsonBody(req)
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return fail(res, 400, 'prompt-empty', '提示词不能为空。')
  if (prompt.length > 8000) return fail(res, 400, 'prompt-long', '提示词太长了（上限 8000 字符）。')
  const settings = await readSettings()
  const size = typeof body.size === 'string' && body.size ? body.size : settings.defaultSize
  const background =
    typeof body.background === 'string' && body.background ? body.background : settings.defaultBackground
  const adapter = getAdapter(body.provider || settings.provider)
  const result = await adapter.generate({ prompt, size, background })
  const { entry } = await saveImage({
    buffer: result.buffer,
    prompt,
    provider: adapter.id,
    size: result.size || size,
    background: result.background || background,
    quality: result.quality,
    generationId: result.generationId,
    usage: result.usage,
    elapsedMs: result.elapsedMs,
  })
  // 这一张会消耗额度，下次打开面板重新读
  clearQuotaCache()
  json(res, 200, { ok: true, image: toImagePayload(entry), usage: result.usage })
}

async function handleHistory(req, res) {
  const body = await readJsonBody(req)
  const settings = await readSettings()
  const limit = Number(body.limit) || Math.min(60, settings.maxHistory)
  const entries = await listImages({ limit })
  json(res, 200, { ok: true, images: entries.map(toImagePayload) })
}

async function handleRemove(req, res) {
  const body = await readJsonBody(req)
  const removed = await removeImage(body.id)
  if (!removed) return fail(res, 404, 'not-found', '这张图不在了。')
  json(res, 200, { ok: true })
}

async function handleSettingsWrite(req, res) {
  const body = await readJsonBody(req)
  const settings = await writeSettings(body)
  clearQuotaCache()
  json(res, 200, { ok: true, settings })
}

async function handleReveal(req, res) {
  const body = await readJsonBody(req)
  const found = await findImage(body.id)
  if (!found) return fail(res, 404, 'not-found', '这张图不在了。')
  const opened = revealInFolder(found.path)
  if (!opened) return fail(res, 500, 'reveal', '没能打开文件管理器。')
  json(res, 200, { ok: true })
}

async function serveIcon(req, res) {
  let stat
  try {
    stat = await fs.stat(ICON_FILE)
  } catch {
    return fail(res, 404, 'not-found', '找不到插件图标。')
  }
  res.writeHead(200, {
    'content-type': 'image/png',
    'content-length': stat.size,
    'cache-control': 'private, max-age=86400',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(ICON_FILE)
    .on('error', () => {
      res.destroy()
    })
    .pipe(res)
}

async function serveMedia(req, res, fileName) {
  const id = fileName.replace(/\.[a-z0-9]+$/i, '')
  const found = await findImage(id)
  if (!found || found.entry.file !== fileName) return fail(res, 404, 'not-found', '这张图不在了。')
  let stat
  try {
    stat = await fs.stat(found.path)
  } catch {
    return fail(res, 404, 'not-found', '图片文件已丢失。')
  }
  const ext = fileName.split('.').pop().toLowerCase()
  res.writeHead(200, {
    'content-type': MIME[ext] || found.entry.mediaType || 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': 'private, max-age=31536000, immutable',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(found.path)
    .on('error', () => {
      res.destroy()
    })
    .pipe(res)
}

function createHandler() {
  return async function handler(req, res) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname
    if (!path.startsWith(BASE)) return fail(res, 404, 'not-found', '未知路径')
    const rest = path.slice(BASE.length) || '/'
    try {
      if (rest.startsWith('/media/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
        const fileName = decodeURIComponent(rest.slice('/media/'.length))
        if (!fileName || fileName.includes('/') || fileName.includes('..')) return fail(res, 400, 'bad-path', '路径不合法')
        return await serveMedia(req, res, fileName)
      }
      if (rest === '/icon.png') {
        if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
        return await serveIcon(req, res)
      }
      if (rest === '/' || rest === '') {
        return json(res, 200, { ok: true, plugin: 'image-studio', version: VERSION })
      }
      if (req.method === 'GET' && rest === '/api/status') return await handleStatus(req, res)
      if (req.method !== 'POST') return fail(res, 405, 'method', '只支持 POST')
      if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
      switch (rest) {
        case '/api/quota':
          return await handleQuota(req, res)
        case '/api/generate':
          return await handleGenerate(req, res)
        case '/api/history':
          return await handleHistory(req, res)
        case '/api/remove':
          return await handleRemove(req, res)
        case '/api/settings':
          return await handleSettingsWrite(req, res)
        case '/api/reveal':
          return await handleReveal(req, res)
        default:
          return fail(res, 404, 'not-found', '未知接口')
      }
    } catch (err) {
      const { code, message } = describeError(err)
      const status = Number(err && err.statusCode) || 500
      return fail(res, status, code, message)
    }
  }
}

function textBlock(text) {
  return [{ type: 'text', text }]
}

function formatQuotaText(quota) {
  const lines = []
  lines.push(`套餐：${quota.plan || '未知'}${quota.provider === 'codex' ? '（ChatGPT 订阅）' : ''}`)
  for (const window of quota.windows || []) {
    const used = window.usedPercent == null ? '未知' : `${Math.round(window.usedPercent)}%`
    const minutes = window.windowMinutes
    const span = minutes == null ? '' : minutes >= 1440 ? `${Math.round(minutes / 1440)} 天` : `${minutes} 分钟`
    const reset = window.resetsAt ? new Date(window.resetsAt).toLocaleString('zh-CN') : '未知'
    lines.push(`${window.kind === 'primary' ? '主窗口' : '次窗口'}：已用 ${used}${span ? `（${span} 窗口）` : ''}，重置于 ${reset}`)
  }
  if (!quota.windows || !quota.windows.length) lines.push('没有读到额度窗口数据。')
  if (quota.credits && quota.credits.hasCredits && quota.credits.balance) lines.push(`额外额度余额：${quota.credits.balance}`)
  if (quota.resetCredits && quota.resetCredits.availableCount) {
    const expires = quota.resetCredits.nextExpiresAt
      ? new Date(quota.resetCredits.nextExpiresAt).toLocaleString('zh-CN')
      : null
    lines.push(`可用的重置次数：${quota.resetCredits.availableCount}${expires ? `（最近一次 ${expires} 前有效）` : ''}`)
  }
  return lines.join('\n')
}

const TOOLS = [
  {
    name: 'image_studio_generate',
    description:
      'Generate one image with the user\'s own Codex (ChatGPT subscription) quota and save it into the local image library. Returns the saved file path so you can show or attach it. Requires the image studio plugin to be configured with a signed-in Codex account.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'What to draw. Describe subject, composition, style and mood; write it in the language the user used.',
        },
        size: {
          type: 'string',
          enum: ['auto', '1024x1536', '1536x1024', '1024x1024'],
          description:
            'Requested canvas: auto (default, let the model choose), 1024x1536 portrait, 1536x1024 landscape, 1024x1024 square. The backend may adjust it to fit the scene.',
        },
        background: {
          type: 'string',
          enum: ['opaque', 'transparent'],
          description: 'opaque (default) paints a full scene; transparent returns a PNG with a see-through background for stickers or cutouts.',
        },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          id: { type: 'string' },
          width: { type: 'number' },
          height: { type: 'number' },
          bytes: { type: 'number' },
          quality: { type: 'string' },
          elapsedMs: { type: 'number' },
        },
        required: ['path', 'id'],
      },
      render(args, value) {
        const v = value || {}
        const dims = v.width && v.height ? `${v.width}×${v.height}` : '尺寸未知'
        return textBlock(
          `已生成并保存：${v.path}（${dims}，${Math.round((v.bytes || 0) / 1024)} KB，${v.quality || '默认画质'}）`,
        )
      },
    },
    async execute(args) {
      const prompt = typeof args?.prompt === 'string' ? args.prompt.trim() : ''
      if (!prompt) throw new Error('prompt 不能为空')
      const settings = await readSettings()
      const size = typeof args?.size === 'string' && args.size ? args.size : settings.defaultSize
      const background = args?.background === 'transparent' ? 'transparent' : settings.defaultBackground
      const adapter = getAdapter(settings.provider)
      const result = await adapter.generate({ prompt, size, background })
      const { entry } = await saveImage({
        buffer: result.buffer,
        prompt,
        provider: adapter.id,
        size: result.size || size,
        background: result.background || background,
        quality: result.quality,
        generationId: result.generationId,
        usage: result.usage,
        elapsedMs: result.elapsedMs,
      })
      clearQuotaCache()
      return {
        path: join(dataDir(), 'images', entry.file),
        id: entry.id,
        width: entry.width,
        height: entry.height,
        bytes: entry.bytes,
        quality: entry.quality || '',
        elapsedMs: entry.elapsedMs || 0,
      }
    },
  },
  {
    name: 'image_studio_quota',
    description:
      'Read the subscription quota behind the image studio plugin: plan name, used percentage of each rate-limit window, when it resets, and remaining reset credits.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: {
        type: 'object',
        properties: {
          plan: { type: 'string' },
          usedPercent: { type: 'number' },
          resetsAt: { type: 'string' },
        },
        required: ['plan'],
      },
      render(args, value) {
        const v = value || {}
        const first = (v.windows || [])[0]
        const used = first && first.usedPercent != null ? `${Math.round(first.usedPercent)}%` : '未知'
        return textBlock(`套餐 ${v.plan || '未知'}，主窗口已用 ${used}${first && first.resetsAt ? `，重置于 ${new Date(first.resetsAt).toLocaleString('zh-CN')}` : ''}`)
      },
    },
    async execute() {
      const quota = await getQuota({ force: true })
      return {
        plan: quota.plan || 'unknown',
        usedPercent: quota.windows?.[0]?.usedPercent ?? 0,
        resetsAt: quota.windows?.[0]?.resetsAt || '',
        summary: formatQuotaText(quota),
        windows: quota.windows || [],
        resetCredits: quota.resetCredits || null,
      }
    },
  },
]

export function apply(ctx) {
  const handler = createHandler()
  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: BASE, handler }), 'image-studio: http api')
  for (const tool of TOOLS) {
    ctx.effect(() => {
      try {
        return ctx.tools.register(tool)
      } catch (err) {
        console.warn(`[image-studio] 工具 ${tool.name} 注册失败：${err && err.message ? err.message : err}`)
        return () => {}
      }
    }, `image-studio: tool ${tool.name}`)
  }
}
