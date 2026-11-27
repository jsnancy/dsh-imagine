// 本机持久化：设置 + 图片历史（$DSH_HOME/image-studio）。
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { dataDir, imagesDir, indexFile, settingsFile } from './paths.js'

const DEFAULT_SETTINGS = {
  provider: 'codex',
  proxy: 'auto', // 'auto' | 'off' | '127.0.0.1:7890'
  codexPath: '',
  defaultSize: 'auto', // 'auto' | '1024x1536'
  defaultBackground: 'opaque', // 'opaque' | 'transparent'
  maxHistory: 120,
  lang: 'auto', // 'auto' | 'zh' | 'en' —— 面板语言，auto 跟随界面
  handrawLocalDir: '', // handraw-style 本地仓库目录（可选，配了就直接从本地读素材图）
  cacheLimitMB: 0, // 素材缓存上限（MB），0 = 不限制
}

const MAX_HISTORY_LIMIT = 300
const ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/

async function readJson(file, fallback) {
  try {
    const text = await fs.readFile(file, 'utf8')
    const value = JSON.parse(text)
    return value && typeof value === 'object' ? value : fallback
  } catch {
    return fallback
  }
}

async function writeJsonAtomic(file, value) {
  await fs.mkdir(dataDir(), { recursive: true })
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await fs.rename(tmp, file)
}

// index.json 的读改写串行化，避免并发生成时互相覆盖。
let writeChain = Promise.resolve()
function serialize(task) {
  const run = writeChain.then(task, task)
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function clampHistory(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(MAX_HISTORY_LIMIT, Math.floor(n)))
}

function sanitizeProxyInput(value, fallback) {
  if (typeof value !== 'string') return fallback
  const raw = value.trim().slice(0, 200)
  if (!raw) return fallback
  return raw
}

export async function readSettings() {
  const stored = await readJson(settingsFile(), {})
  const merged = { ...DEFAULT_SETTINGS, ...stored }
  merged.maxHistory = clampHistory(merged.maxHistory, DEFAULT_SETTINGS.maxHistory)
  if (typeof merged.proxy !== 'string' || !merged.proxy.trim()) merged.proxy = DEFAULT_SETTINGS.proxy
  if (typeof merged.codexPath !== 'string') merged.codexPath = ''
  if (!merged.provider) merged.provider = DEFAULT_SETTINGS.provider
  if (!['auto', '1024x1536'].includes(merged.defaultSize)) merged.defaultSize = 'auto'
  if (!['opaque', 'transparent'].includes(merged.defaultBackground)) merged.defaultBackground = 'opaque'
  if (!['auto', 'zh', 'en'].includes(merged.lang)) merged.lang = DEFAULT_SETTINGS.lang
  return merged
}

export async function writeSettings(patch = {}) {
  const current = await readSettings()
  const next = { ...current }
  if (typeof patch.provider === 'string' && patch.provider.trim()) next.provider = patch.provider.trim().slice(0, 40)
  if (patch.proxy !== undefined) next.proxy = sanitizeProxyInput(patch.proxy, current.proxy)
  if (typeof patch.codexPath === 'string') next.codexPath = patch.codexPath.trim().slice(0, 500)
  if (patch.defaultSize === 'auto' || patch.defaultSize === '1024x1536') next.defaultSize = patch.defaultSize
  if (patch.lang === 'zh' || patch.lang === 'en' || patch.lang === 'auto') next.lang = patch.lang
  if (patch.defaultBackground === 'opaque' || patch.defaultBackground === 'transparent') {
    next.defaultBackground = patch.defaultBackground
  }
  if (patch.maxHistory !== undefined) next.maxHistory = clampHistory(patch.maxHistory, current.maxHistory)
  if (typeof patch.handrawLocalDir === 'string') next.handrawLocalDir = patch.handrawLocalDir.trim().slice(0, 500)
  if (patch.cacheLimitMB !== undefined) {
    const value = Math.trunc(Number(patch.cacheLimitMB))
    next.cacheLimitMB = Number.isFinite(value) && value >= 0 && value <= 20000 ? value : current.cacheLimitMB
  }
  await writeJsonAtomic(settingsFile(), next)
  return next
}

/** 从图片字节里读尺寸；识别不出时返回 null。 */
export function measureImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 24) return null
  // PNG：89 50 4E 47 0D 0A 1A 0A，IHDR 宽高在 16/20 偏移
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mediaType: 'image/png', ext: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2
    while (i + 9 < buffer.length) {
      if (buffer[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = buffer[i + 1]
      const length = buffer.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { mediaType: 'image/jpeg', ext: 'jpg', width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) }
      }
      i += 2 + Math.max(2, length)
    }
    return { mediaType: 'image/jpeg', ext: 'jpg', width: 0, height: 0 }
  }
  const signature = buffer.subarray(0, 12).toString('latin1')
  if (signature.startsWith('RIFF') && signature.slice(8, 12) === 'WEBP') {
    return { mediaType: 'image/webp', ext: 'webp', width: 0, height: 0 }
  }
  return null
}

async function readIndex() {
  const value = await readJson(indexFile(), [])
  if (Array.isArray(value)) return value.filter((item) => item && typeof item.id === 'string')
  if (value && Array.isArray(value.images)) return value.images.filter((item) => item && typeof item.id === 'string')
  return []
}

async function writeIndex(entries) {
  await writeJsonAtomic(indexFile(), entries)
}

export async function listImages({ limit = 30 } = {}) {
  const entries = await readIndex()
  const n = Math.max(1, Math.min(MAX_HISTORY_LIMIT, Math.floor(Number(limit) || 30)))
  return entries.slice(0, n)
}

/** 保存一张生成结果，返回写进历史的条目。 */
export async function saveImage({ buffer, prompt, provider, size, background, quality, generationId, usage, elapsedMs }) {
  const info = measureImage(buffer)
  if (!info) throw new Error('生成的图片格式无法识别')
  const id = `${Date.now().toString(36)}${randomUUID().slice(0, 8)}`
  const file = `${id}.${info.ext}`
  await fs.mkdir(imagesDir(), { recursive: true })
  await fs.writeFile(join(imagesDir(), file), buffer)
  const settings = await readSettings()
  const entry = {
    id,
    file,
    mediaType: info.mediaType,
    bytes: buffer.length,
    width: info.width,
    height: info.height,
    prompt: String(prompt || '').slice(0, 4000),
    provider: provider || 'codex',
    size: size || null,
    background: background || null,
    quality: quality || null,
    generationId: generationId || null,
    usage: usage && typeof usage === 'object' ? usage : null,
    elapsedMs: Number.isFinite(elapsedMs) ? elapsedMs : null,
    createdAt: Date.now(),
  }
  const { kept, evicted } = await serialize(async () => {
    const entries = await readIndex()
    entries.unshift(entry)
    const kept = entries.slice(0, settings.maxHistory)
    const evicted = entries.slice(settings.maxHistory)
    await writeIndex(kept)
    return { kept, evicted }
  })
  // 超出上限的旧图连同文件一起清掉
  for (const item of evicted) {
    if (item && typeof item.file === 'string') {
      await fs.rm(join(imagesDir(), item.file), { force: true }).catch(() => {})
    }
  }
  return { entry, total: kept.length }
}

export async function findImage(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null
  const entries = await readIndex()
  const entry = entries.find((item) => item.id === id)
  if (!entry) return null
  return { entry, path: join(imagesDir(), entry.file) }
}

export async function removeImage(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return false
  return serialize(async () => {
    const entries = await readIndex()
    const index = entries.findIndex((item) => item.id === id)
    if (index < 0) return false
    const [entry] = entries.splice(index, 1)
    await writeIndex(entries)
    if (entry && typeof entry.file === 'string') {
      await fs.rm(join(imagesDir(), entry.file), { force: true }).catch(() => {})
    }
    return true
  })
}

export { DEFAULT_SETTINGS }
