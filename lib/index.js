// 十六跟做图 · 宿主半边
//   - 把 ChatGPT 订阅额度暴露成一组本地 HTTP 接口给面板用（/image-studio/api/*）
//   - 生成结果落在 $DSH_HOME/image-studio/images，经 /image-studio/media/<id>.<ext> 回给界面
//   - 给对话侧留两个工具：image_studio_generate / image_studio_quota
import { createReadStream, promises as fs } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listImages, readSettings, writeSettings, saveImage, findImage, removeImage } from './store.js'
import { listProviders, getAdapter, getQuota, clearQuotaCache } from './providers.js'
import { dataDir } from './paths.js'
import { getIndexPayload, getItem, getIndex } from './handraw/catalog.js'
import { composePrompt } from './handraw/compose.js'
import {
  bundledCover,
  cacheStats,
  clearAssetCache,
  listAssetPaths,
  readAsset,
  startSync,
  syncState,
} from './handraw/assets.js'
import { imageCapability } from './codex.js'

export const name = 'image-studio'
export const inject = ['webServer', 'tools', 'connection']

const BASE = '/image-studio'
const VERSION = '0.5.1'
const MAX_JSON_BODY = 32 * 1024

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }
const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const ICON_FILE = join(PKG_ROOT, 'icon.png')
const SKIN_FILE = join(PKG_ROOT, 'lib', 'skin-handdrawn.css')

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

async function handleStatus(ctx, req, res) {
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
    capability: typeof adapter.capability === 'function' ? adapter.capability() : null,
  })
}

async function handleQuota(req, res) {
  clearQuotaCache()
  const quota = await getQuota({ force: true })
  json(res, 200, { ok: true, quota })
}

/** data URL → {buffer, mediaType, filename}；格式与体积都做校验。 */
function decodeReference(value) {
  if (typeof value !== 'string' || !value.startsWith('data:')) return null
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(value.trim())
  if (!match) {
    const err = new Error('参考图只支持 PNG / JPEG / WebP 的 data URL。')
    err.statusCode = 400
    err.code = 'bad-reference'
    throw err
  }
  const mediaType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1]
  const buffer = Buffer.from(match[2].replace(/\s+/g, ''), 'base64')
  if (!buffer.length) {
    const err = new Error('参考图内容为空。')
    err.statusCode = 400
    err.code = 'bad-reference'
    throw err
  }
  if (buffer.length > 12 * 1024 * 1024) {
    const err = new Error('参考图太大了（上限 12MB）。')
    err.statusCode = 413
    err.code = 'reference-too-large'
    throw err
  }
  const ext = mediaType === 'image/png' ? 'png' : mediaType === 'image/webp' ? 'webp' : 'jpg'
  return { buffer, mediaType, filename: `reference.${ext}` }
}

async function handleGenerate(req, res) {
  const body = await readJsonBody(req, 16 * 1024 * 1024)
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return fail(res, 400, 'prompt-empty', '提示词不能为空。')
  if (prompt.length > 8000) return fail(res, 400, 'prompt-long', '提示词太长了（上限 8000 字符）。')
  const settings = await readSettings()
  const size = typeof body.size === 'string' && body.size ? body.size : settings.defaultSize
  const background =
    typeof body.background === 'string' && body.background ? body.background : settings.defaultBackground
  const adapter = getAdapter(body.provider || settings.provider)
  const reference = decodeReference(body.reference)
  const result = await adapter.generate({ prompt, size, background, reference })
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
  // 也允许传导出文件的绝对路径，但必须落在 exports 目录里
  if (body && typeof body.path === 'string' && body.path) {
    const target = resolve(body.path)
    const exportsDir = join(dataDir(), 'exports')
    if (!target.startsWith(exportsDir + sep)) return fail(res, 400, 'bad-path', '只能打开导出目录里的文件。')
    const opened = revealInFolder(target)
    if (!opened) return fail(res, 500, 'reveal', '没能打开文件管理器。')
    return json(res, 200, { ok: true })
  }
  const found = await findImage(body.id)
  if (!found) return fail(res, 404, 'not-found', '这张图不在了。')
  const opened = revealInFolder(found.path)
  if (!opened) return fail(res, 500, 'reveal', '没能打开文件管理器。')
  json(res, 200, { ok: true })
}

async function serveSkin(req, res) {
  let stat
  try {
    stat = await fs.stat(SKIN_FILE)
  } catch {
    return fail(res, 404, 'not-found', '找不到皮肤样式。')
  }
  res.writeHead(200, {
    'content-type': 'text/css; charset=utf-8',
    'content-length': stat.size,
    'cache-control': 'private, max-age=3600',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(SKIN_FILE)
    .on('error', () => {
      res.destroy()
    })
    .pipe(res)
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
    'cache-control': 'private, max-age=300',
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

/**
 * 模板库接口（/image-studio/templates/*）。
 *
 *   GET  /templates/index          594 条素材 + 60 个精选场景的索引（gzip + ETag）
 *   GET  /templates/item/<id>      单条素材全文（含提示词正文与署名）
 *   GET  /templates/cover/<file>   随包分发的精选场景封面
 *   GET  /templates/asset?path=…   其余素材图：磁盘缓存优先，没有再按需拉取
 *   GET  /templates/status         缓存进度
 *   POST /templates/compose        把参数拼成提示词
 */
async function handleTemplates(ctx, req, res, rest) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (rest === '/templates/index') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
    const payload = getIndexPayload()
    if (req.headers['if-none-match'] === payload.etag) {
      res.writeHead(304, { etag: payload.etag, 'cache-control': 'private, max-age=60' })
      res.end()
      return
    }
    const gzip = /gzip/i.test(String(req.headers['accept-encoding'] || ''))
    const body = gzip ? payload.gzip : payload.json
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-encoding': gzip ? 'gzip' : 'identity',
      'content-length': body.length,
      etag: payload.etag,
      'cache-control': 'private, max-age=60',
    })
    if (req.method === 'HEAD') res.end()
    else res.end(body)
    return
  }

  if (rest.startsWith('/templates/item/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
    const id = decodeURIComponent(rest.slice('/templates/item/'.length))
    const item = getItem(id)
    if (!item) return fail(res, 404, 'not-found', '没有这条素材。')
    return json(res, 200, { ok: true, item })
  }

  if (rest.startsWith('/templates/cover/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
    const file = decodeURIComponent(rest.slice('/templates/cover/'.length))
    const full = bundledCover(file)
    if (!full) return fail(res, 404, 'not-found', '没有这张封面。')
    let stat
    try {
      stat = await fs.stat(full)
    } catch {
      return fail(res, 404, 'not-found', '封面文件已丢失。')
    }
    res.writeHead(200, {
      'content-type': 'image/webp',
      'content-length': stat.size,
      'cache-control': 'private, max-age=31536000, immutable',
    })
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    createReadStream(full)
      .on('error', () => res.destroy())
      .pipe(res)
    return
  }

  if (rest === '/templates/asset') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
    const rel = url.searchParams.get('path') || ''
    const asset = await readAsset(rel)
    res.writeHead(200, {
      'content-type': 'image/webp',
      'content-length': asset.buffer.length,
      'cache-control': 'private, max-age=31536000, immutable',
      'x-asset-cache': asset.cache,
    })
    if (req.method === 'HEAD') res.end()
    else res.end(asset.buffer)
    return
  }

  if (rest === '/templates/status') {
    if (req.method !== 'GET') return fail(res, 405, 'method', '只支持 GET')
    const index = getIndex()
    const cache = await cacheStats()
    return json(res, 200, {
      ok: true,
      version: VERSION,
      templateVersion: index.version,
      source: index.source,
      license: index.license,
      counts: index.counts,
      cached: cache.cached,
      bytes: cache.bytes,
      total: index.counts.total,
      limitMB: cache.limitMB,
      overLimit: cache.overLimit,
      localDir: cache.localDir,
      localReady: cache.localReady,
      assets: listAssetPaths().length,
      sync: syncState(),
      capability: imageCapability(),
    })
  }

  if (rest === '/templates/sync') {
    if (req.method === 'GET') return json(res, 200, { ok: true, sync: syncState() })
    if (req.method !== 'POST') return fail(res, 405, 'method', '只支持 GET/POST')
    if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
    const body = await readJsonBody(req)
    const result = await startSync({ scope: body.scope === 'all' ? 'all' : 'missing' })
    return json(res, 200, { ok: true, started: result.started, sync: result.state })
  }

  if (rest === '/templates/cache') {
    if (req.method !== 'POST' && req.method !== 'DELETE') return fail(res, 405, 'method', '只支持 POST/DELETE')
    if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
    if (syncState().running) return fail(res, 409, 'sync-running', '正在同步素材，等同步结束后再清理。')
    await clearAssetCache()
    const cache = await cacheStats()
    return json(res, 200, { ok: true, cached: cache.cached, bytes: cache.bytes })
  }

  if (rest === '/templates/export') {
    if (req.method !== 'POST') return fail(res, 405, 'method', '只支持 POST')
    if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
    return await handleExport(req, res)
  }

  if (rest === '/templates/assist') {
    if (req.method !== 'POST') return fail(res, 405, 'method', '只支持 POST')
    if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
    return await handleAssist(ctx, req, res)
  }

  if (rest === '/templates/compose') {
    if (req.method !== 'POST') return fail(res, 405, 'method', '只支持 POST')
    if (!sameOrigin(req)) return fail(res, 403, 'origin', '只接受本站请求')
    const body = await readJsonBody(req, 64 * 1024)
    const result = composePrompt(body)
    return json(res, 200, { ok: true, ...result })
  }

  return fail(res, 404, 'not-found', '未知模板接口')
}

/**
 * 这组路由挂在公共 webServer 上，必须自己过 Connection 的 Host/Origin 检查与浏览器认证。
 * 宿主没提供鉴权能力时一律拒绝，宁可面板报错也不把生图接口和本地图片库暴露给任意网页。
 */
function connectionRejection(ctx, req) {
  const connection = ctx.connection
  if (!connection || typeof connection.requestRejection !== 'function') return 403
  try {
    return connection.requestRejection({ headers: req.headers }) || undefined
  } catch {
    return 403
  }
}


/** 导出目录：$DSH_HOME/image-studio/exports */
function exportsDir() {
  return join(dataDir(), 'exports')
}

function slugify(text, fallback) {
  const base = String(text || '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || fallback
}

/**
 * 批量导出：把一批模板/素材的提示词写成一个 .md 文件，落盘后由界面调 /api/reveal 打开。
 * body: { items:[{id,title,titleEn,template,params,prompt}], name? }
 */
/** 把素材编号拼成一段可复制的提示词（不做主题拼装，素材本身就是原文）。 */
function assetPrompt(item) {
  const body = item.body && (item.body.zh || item.body.en)
  if (!body) return item.title || ''
  if (item.kind === 'style') {
    const lines = [`画风：${item.title}（${item.id}）`]
    if (item.credit) lines.push(`参考风格名称：${item.credit}`)
    lines.push(`纯视觉画风特征（禁止照抄示例主体）：${body}`)
    return lines.join('\n')
  }
  if (item.kind === 'layout') return `排版图型（${item.id}）：${body}`
  if (item.kind === 'color') return body
  if (item.kind === 'tone') return `影调：${item.title}。${body}`
  return body
}

/** 按编号导出的行：精选场景走拼装器，素材走原文。 */
function rowsFromIds(ids, themeHint) {
  const rows = []
  for (const raw of ids.slice(0, 400)) {
    const id = typeof raw === 'string' ? raw.trim() : ''
    if (!id) continue
    const curated = getIndex().curated.find(row => row.id === id)
    if (curated) {
      const composed = composePrompt({
        layout: curated.layout,
        style: curated.style,
        color: curated.color,
        tone: curated.tone,
        ratio: curated.ratio,
        mode: curated.mode,
        theme: themeHint || curated.themeHint || '',
      })
      rows.push({
        id: curated.id,
        title: curated.title,
        template: `${curated.id} · ${curated.layout} · ${curated.style} · ${curated.color} · ${curated.tone} · ${curated.ratio} · ${curated.mode}`,
        params: { layout: curated.layout, style: curated.style, color: curated.color, tone: curated.tone, ratio: curated.ratio, mode: curated.mode },
        prompt: composed.prompt,
      })
      continue
    }
    const item = getItem(id)
    if (!item) continue
    rows.push({
      id: item.id,
      title: item.title,
      template: `${item.kind} ${item.id}`,
      params: { kind: item.kind },
      prompt: assetPrompt(item),
    })
  }
  return rows
}

async function handleExport(req, res) {
  const body = await readJsonBody(req, 4 * 1024 * 1024)
  let items = Array.isArray(body.items) ? body.items : []
  if (!items.length && Array.isArray(body.ids)) items = rowsFromIds(body.ids, body.theme)
  if (!items.length) return fail(res, 400, 'empty-export', '没有可导出的内容。')
  if (items.length > 400) return fail(res, 400, 'too-many', '一次最多导出 400 条。')
  const rows = items
    .filter(item => item && typeof item.prompt === 'string' && item.prompt.trim())
    .map(item => ({
      id: String(item.id || '').slice(0, 40),
      title: String(item.title || '').slice(0, 120),
      template: String(item.template || '').slice(0, 200),
      params: item.params && typeof item.params === 'object' ? item.params : null,
      prompt: String(item.prompt).slice(0, 8000),
    }))
  if (!rows.length) return fail(res, 400, 'empty-export', '没有可导出的内容。')

  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const name = `${slugify(body.name, 'handraw')}-${stamp}.md`
  const lines = [
    '---',
    `title: ${body.name || 'handraw-style 提示词合集'}`,
    `count: ${rows.length}`,
    'source: https://github.com/yang0/handraw-style',
    `exported: ${now.toISOString()}`,
    'license: MIT (with attribution) — © yang0',
    '---',
    '',
    `# ${body.name || 'handraw-style 提示词合集'}`,
    '',
    `> 共 ${rows.length} 条，来自手绘风格提示词库 handraw-style（作者 yang0，MIT 署名许可）。`,
    '> 示例图的画面内容不会写进提示词：画风只描述媒介、光影、色彩这类纯视觉语言。',
    '',
  ]
  rows.forEach((row, index) => {
    lines.push(`## ${index + 1}. ${row.title || row.id}`)
    lines.push('')
    if (row.id) lines.push(`- 编号：\`${row.id}\``)
    if (row.template) lines.push(`- 配方：${row.template}`)
    if (row.params) {
      const pairs = Object.entries(row.params)
        .filter(([, value]) => value != null && value !== '')
        .map(([key, value]) => `${key}=${value}`)
      if (pairs.length) lines.push(`- 参数：${pairs.join(' · ')}`)
    }
    lines.push('')
    lines.push('```text')
    lines.push(row.prompt.trim())
    lines.push('```')
    lines.push('')
  })
  lines.push('---')
  lines.push('')
  lines.push('提示词内容 © yang0 · https://github.com/yang0/handraw-style · MIT（保留署名）')

  const dir = exportsDir()
  await fs.mkdir(dir, { recursive: true })
  const file = join(dir, name)
  await fs.writeFile(file, lines.join('\n'), 'utf8')
  return json(res, 200, { ok: true, path: file, count: rows.length, bytes: Buffer.byteLength(lines.join('\n')) })
}

/** 从 llm.stream 的任意 chunk 里能拿到的文本增量。 */
function chunkText(chunk) {
  if (!chunk || typeof chunk !== 'object') return ''
  if (typeof chunk.text === 'string') return chunk.text
  if (typeof chunk.delta === 'string') return chunk.delta
  if (chunk.delta && typeof chunk.delta.text === 'string') return chunk.delta.text
  if (typeof chunk.deltaText === 'string') return chunk.deltaText
  if (chunk.block && chunk.block.type === 'text' && typeof chunk.block.text === 'string') return chunk.block.text
  if (Array.isArray(chunk.blocks)) {
    return chunk.blocks.filter(block => block && block.type === 'text').map(block => block.text || '').join('')
  }
  return ''
}

async function pickRoute(llm) {
  if (typeof llm.listProviders === 'function') {
    const providers = await Promise.resolve(llm.listProviders()).catch(() => [])
    for (const entry of Array.isArray(providers) ? providers : []) {
      const provider = typeof entry === 'string' ? entry : entry && (entry.id || entry.provider || entry.name)
      if (!provider) continue
      if (typeof llm.listModels === 'function') {
        const models = await Promise.resolve(llm.listModels(provider)).catch(() => [])
        const first = Array.isArray(models) ? models[0] : null
        const model = typeof first === 'string' ? first : first && (first.id || first.model || first.name)
        if (model) return { provider, model }
      }
    }
  }
  if (typeof llm.defaultRoute === 'function') {
    const route = await Promise.resolve(llm.defaultRoute()).catch(() => null)
    if (route && route.provider && route.model) return { provider: route.provider, model: route.model }
  }
  return null
}

/**
 * AI 辅助设计：只让模型从既有素材清单里挑参数（返回受限 JSON），从不写提示词正文。
 * body: { theme, whitespace? }
 */
async function handleAssist(ctx, req, res) {
  const body = await readJsonBody(req)
  const theme = typeof body.theme === 'string' ? body.theme.trim().slice(0, 300) : ''
  if (!theme) return fail(res, 400, 'theme-empty', '先写一句主题，再让 AI 配参数。')
  const llm = ctx.get ? ctx.get('llm') : null
  if (!llm || typeof llm.stream !== 'function') {
    return fail(res, 503, 'llm-unavailable', '当前环境没有可用的模型服务，无法使用 AI 辅助设计。')
  }
  const route = await pickRoute(llm)
  if (!route) return fail(res, 503, 'llm-route', '没有找到可用的模型，先在设置里选一个模型。')

  const index = getIndex()
  const menu = {
    layouts: index.items.filter(item => item.kind === 'layout').map(item => `${item.id} ${item.title}`),
    styles: index.items.filter(item => item.kind === 'style').map(item => `${item.id} ${item.title}`),
    colors: index.items.filter(item => item.kind === 'color').map(item => `${item.id} ${item.title}`),
    tones: index.items.filter(item => item.kind === 'tone').map(item => `${item.id} ${item.title}`),
  }
  const system = [
    '你是手绘风格海报参数助手。用户给一句主题，你只从给定清单里挑选参数，绝不写提示词正文。',
    '只能输出一个 JSON 对象，不要解释、不要 Markdown 代码块。',
    '字段：layout（清单里的图型编号）、style（画风编号）、color（主题色编号）、tone（影调编号）、ratio（3:4|4:5|1:1|16:9|9:16|4:3|3:2|2:3|21:9 之一）、mode（graphic-text 或 pure-image）、reason（一句中文理由，30 字内）。',
    '挑不到合适的就省略该字段，但 layout 与 style 必填。',
  ].join('\n')
  const user = `主题：${theme}\n\n可选清单（每行「编号 名称」）：\n${JSON.stringify(menu)}`

  let text = ''
  try {
    for await (const chunk of llm.stream({
      provider: route.provider,
      model: route.model,
      messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
      system,
      maxTokens: 400,
      signal: AbortSignal.timeout(45000),
    })) {
      text += chunkText(chunk)
    }
  } catch (err) {
    const message = err && err.message ? err.message : String(err)
    if (err && err.name === 'AbortError') return fail(res, 504, 'llm-timeout', '模型 45 秒没有回答，稍后再试。')
    return fail(res, 502, 'llm-failed', `模型调用失败：${message}`)
  }

  const match = /\{[\s\S]*\}/.exec(text)
  if (!match) return fail(res, 502, 'llm-format', '模型没有返回可解析的 JSON。')
  let picked
  try {
    picked = JSON.parse(match[0])
  } catch {
    return fail(res, 502, 'llm-format', '模型返回的 JSON 解析失败。')
  }
  const clean = {}
  const check = (kind, value) => {
    if (typeof value !== 'string') return null
    const item = getItem(value.trim())
    if (!item || item.kind !== kind) return null
    return item.id
  }
  const layout = check('layout', picked.layout)
  const style = check('style', picked.style)
  if (!layout || !style) return fail(res, 422, 'llm-bad-pick', '模型给的是清单外的编号，换一句主题再试。')
  clean.layout = layout
  clean.style = style
  const color = check('color', picked.color)
  if (color) clean.color = color
  const tone = check('tone', picked.tone)
  if (tone) clean.tone = tone
  const RATIOS = ['3:4', '4:5', '1:1', '16:9', '9:16', '4:3', '3:2', '2:3', '21:9']
  if (RATIOS.includes(picked.ratio)) clean.ratio = picked.ratio
  clean.mode = picked.mode === 'pure-image' ? 'pure-image' : 'graphic-text'
  return json(res, 200, {
    ok: true,
    params: clean,
    reason: typeof picked.reason === 'string' ? picked.reason.slice(0, 120) : '',
    route,
  })
}

function createHandler(ctx) {
  return async function handler(req, res) {
    const rejection = connectionRejection(ctx, req)
    if (rejection) {
      res.writeHead(rejection, {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      })
      res.end(rejection === 401 ? '未登录' : '禁止访问')
      return
    }
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname
    if (!path.startsWith(BASE)) return fail(res, 404, 'not-found', '未知路径')
    const rest = path.slice(BASE.length) || '/'
    try {
      if (rest.startsWith('/templates/')) return await handleTemplates(ctx, req, res, rest)
      if (rest.startsWith('/media/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
        const fileName = decodeURIComponent(rest.slice('/media/'.length))
        if (!fileName || fileName.includes('/') || fileName.includes('..')) return fail(res, 400, 'bad-path', '路径不合法')
        return await serveMedia(req, res, fileName)
      }
      if (rest === '/skin.css') {
        if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
        return await serveSkin(req, res)
      }
      if (rest === '/icon.png') {
        if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'method', '只支持 GET')
        return await serveIcon(req, res)
      }
      if (rest === '/' || rest === '') {
        return json(res, 200, { ok: true, plugin: 'image-studio', version: VERSION })
      }
      if (req.method === 'GET' && rest === '/api/status') return await handleStatus(ctx, req, res)
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
  const handler = createHandler(ctx)
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
