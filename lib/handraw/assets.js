/**
 * 素材图片：60 张精选场景封面随包分发（lib/data/img），其余 594 张按需从
 * handraw-style 仓库拉取并落到 $DSH_HOME/image-studio/templates/ 缓存。
 *
 * 只允许拉取白名单里的路径，避免这个同源接口变成任意 URL 的下载器。
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { request, resolveProxy } from '../net.js'
import { dataDir } from '../paths.js'
import { readSettings } from '../store.js'
import { getIndex } from './catalog.js'

const REPO = 'yang0/handraw-style'
const BRANCH = 'main'
const MIRRORS = [
  rel => `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/images/${rel}`,
  rel => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/images/${rel}`,
]

/** 与上游 catalog.js 同一条白名单：individual/FA..FI、colors、tones、layouts/<dir>。 */
const ASSET_RE = /^(?:individual\/(?:FA|FB|FC|FD|FE|FF|FG|FH|FI)\/|colors\/|tones\/|layouts\/[\w-]+\/)[\w-]+\.webp$/
const COVER_RE = /^[A-Z]{2}-\d{3}\.webp$/

const BUNDLED = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'img')

const inflight = new Map()

export function isAssetPath(rel) {
  return typeof rel === 'string' && ASSET_RE.test(rel)
}

/** 随包分发的精选场景封面。 */
export function bundledCover(file) {
  if (!COVER_RE.test(String(file || ''))) return null
  const full = join(BUNDLED, file)
  return existsSync(full) ? full : null
}

export function templatesDir() {
  return join(dataDir(), 'templates')
}

export function cachedPath(rel) {
  return join(templatesDir(), rel)
}

/** 本地仓库目录源：配了 handrawLocalDir 就直接从用户自己的克隆里读图。 */
async function localRoot() {
  const settings = await readSettings()
  const dir = typeof settings.handrawLocalDir === 'string' ? settings.handrawLocalDir.trim() : ''
  if (!dir) return null
  const root = join(dir, 'images')
  return existsSync(root) ? root : null
}

/** 全部需要联网拉取的素材路径（594 条素材各一张图，不重复）。 */
export function listAssetPaths() {
  const index = getIndex()
  const seen = new Set()
  for (const item of index.items) {
    const remote = item.cover && item.cover.remote
    if (remote && isAssetPath(remote)) seen.add(remote)
  }
  return [...seen]
}

async function fetchAsset(rel) {
  const settings = await readSettings()
  const resolved = await resolveProxy(settings.proxy || 'auto')
  const proxy = resolved.proxy || null
  let lastError = null
  for (const mirror of MIRRORS) {
    const target = mirror(rel)
    try {
      const res = await request(target, { proxy, timeoutMs: 30000 })
      if (res.status !== 200) {
        lastError = new Error(`素材源返回 HTTP ${res.status}`)
        lastError.statusCode = 502
        continue
      }
      if (!res.body || !res.body.length) {
        lastError = new Error('素材源返回空内容')
        lastError.statusCode = 502
        continue
      }
      return res.body
    } catch (err) {
      lastError = err
    }
  }
  const err = new Error(`拉取素材失败：${rel}${lastError ? `（${lastError.message}）` : ''}`)
  err.statusCode = 502
  throw err
}

/** 读一张素材：本地仓库目录 → 磁盘缓存 → 网络；同一张并发请求只拉一次。 */
export async function readAsset(rel) {
  if (!isAssetPath(rel)) {
    const err = new Error(`素材路径不合法：${rel}`)
    err.statusCode = 400
    throw err
  }
  const root = await localRoot()
  if (root) {
    const local = join(root, rel)
    if (existsSync(local)) return { buffer: await readFile(local), cache: 'local' }
  }
  const file = cachedPath(rel)
  if (existsSync(file)) return { buffer: await readFile(file), cache: 'disk' }
  if (inflight.has(rel)) return inflight.get(rel)
  const task = (async () => {
    const buffer = await fetchAsset(rel)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, buffer)
    return { buffer, cache: 'net' }
  })().finally(() => inflight.delete(rel))
  inflight.set(rel, task)
  return task
}

/** 缓存了多少张（给面板显示进度，也用于验收）。 */
export async function cacheStats() {
  const root = templatesDir()
  let cached = 0
  let bytes = 0
  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith('.webp')) {
        cached += 1
        try {
          bytes += (await stat(full)).size
        } catch {
          /* 统计失败不影响主流程 */
        }
      }
    }
  }
  await walk(root)
  const settings = await readSettings()
  const limitMB = Number(settings.cacheLimitMB) || 0
  const root2 = await localRoot()
  return {
    cached,
    bytes,
    limitMB,
    overLimit: limitMB > 0 && bytes > limitMB * 1024 * 1024,
    localDir: settings.handrawLocalDir || '',
    localReady: Boolean(root2),
  }
}

/** 后台全量同步：把 594 张素材图下载到本地缓存，进度供面板轮询。 */
let sync = { running: false, total: 0, done: 0, failed: 0, startedAt: null, finishedAt: null, lastError: null }

export function syncState() {
  const ratio = sync.total ? Math.round((sync.done / sync.total) * 100) : 0
  return { ...sync, percent: ratio }
}

export function clearAssetCache() {
  return rm(templatesDir(), { recursive: true, force: true }).then(() => ({ ok: true }))
}

/**
 * @param {{scope?:'missing'|'all', concurrency?:number, onProgress?:Function}} options
 *   missing（默认）只补没缓存的；all 重新拉一遍覆盖已有缓存。
 */
export async function startSync(options = {}) {
  if (sync.running) return { started: false, state: syncState() }
  const scope = options.scope === 'all' ? 'all' : 'missing'
  const all = listAssetPaths()
  const todo = []
  for (const rel of all) {
    if (scope === 'missing' && existsSync(cachedPath(rel))) continue
    todo.push(rel)
  }
  sync = {
    running: true,
    scope,
    total: todo.length,
    done: 0,
    failed: 0,
    startedAt: Date.now(),
    finishedAt: null,
    lastError: null,
    bytes: 0,
  }
  const limit = Math.max(1, Math.min(6, Number(options.concurrency) || 3))
  ;(async () => {
    let cursor = 0
    async function worker() {
      while (cursor < todo.length) {
        const rel = todo[cursor++]
        try {
          const file = cachedPath(rel)
          const buffer = await fetchAsset(rel)
          await mkdir(dirname(file), { recursive: true })
          await writeFile(file, buffer)
          sync.bytes += buffer.length
        } catch (err) {
          sync.failed += 1
          sync.lastError = err && err.message ? err.message : String(err)
        }
        sync.done += 1
        if (typeof options.onProgress === 'function') options.onProgress(syncState())
      }
    }
    await Promise.all(Array.from({ length: limit }, () => worker()))
    sync.running = false
    sync.finishedAt = Date.now()
  })().catch(err => {
    sync.running = false
    sync.finishedAt = Date.now()
    sync.lastError = err && err.message ? err.message : String(err)
  })
  return { started: true, state: syncState() }
}
