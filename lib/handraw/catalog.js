/**
 * 内置素材索引：读取 lib/data/ 下的 catalog.json / curated.json / meta.json。
 *
 * 这些 JSON 由 scripts/build-catalog.mjs 从 handraw-style 仓库生成，随插件一起分发，
 * 所以插件离线也能浏览全部 594 条素材（图片按需拉取，见 assets.js）。
 *
 * 索引对象在进程内构建一次：594 条素材去掉正文后仍然很小，gzip 后只有几十 KB。
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')

const KINDS = ['style', 'layout', 'color', 'tone']

/** 每种素材在「模板库」里的排序与展示标签。 */
export const KIND_LABELS = { style: '画风', layout: '排版图型', color: '主题色', tone: '影调' }

let cache = null

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), 'utf8'))
}

/** 索引条目：不含正文，卡片列表只需要这些字段。 */
function compact(item) {
  const row = {
    id: item.id,
    kind: item.kind,
    title: item.title,
    titleEn: item.titleEn || item.title,
    chars: (item.body && item.body.zh ? item.body.zh.length : 0),
    cover: item.cover,
  }
  if (item.group) row.group = item.group
  if (item.groupId) row.groupId = item.groupId
  if (item.category) row.category = item.category
  if (item.categoryLabel) row.categoryLabel = item.categoryLabel
  if (item.ratio) row.ratio = item.ratio
  if (item.credit) row.credit = item.credit
  if (item.keywords && item.keywords.length) row.keywords = item.keywords
  return row
}

function build() {
  const catalog = readJson('catalog.json')
  const curatedFile = readJson('curated.json')
  const meta = readJson('meta.json')

  const items = Array.isArray(catalog.items) ? catalog.items : []
  const byId = new Map(items.map(item => [item.id, item]))

  const counts = { style: 0, layout: 0, color: 0, tone: 0 }
  const groups = { style: new Map(), layout: new Map(), color: new Map(), tone: new Map() }
  for (const item of items) {
    if (!KINDS.includes(item.kind)) continue
    counts[item.kind] += 1
    if (item.kind === 'style') {
      const key = item.groupId || 'FA'
      const row = groups.style.get(key) || { key, label: item.group || key, count: 0 }
      row.count += 1
      groups.style.set(key, row)
    } else {
      const key = item.category || item.kind
      const row = groups[item.kind].get(key) || { key, label: item.categoryLabel || key, count: 0 }
      row.count += 1
      groups[item.kind].set(key, row)
    }
  }

  const curated = (curatedFile.items || []).map(item => {
    const layout = byId.get(item.layout)
    const style = byId.get(item.style)
    return {
      ...item,
      layoutTitle: layout ? layout.title : null,
      styleTitle: style ? style.title : null,
      chars: item.chars || (layout && layout.body && layout.body.zh ? layout.body.zh.length : 0),
    }
  })

  const index = {
    version: meta.version || null,
    source: { repo: meta.repo, author: meta.author, license: meta.license, builtAt: meta.builtAt },
    counts: (() => {
      const total = counts.style + counts.layout + counts.color + counts.tone
      return { ...counts, curated: curated.length, total, all: total + curated.length }
    })(),
    groups: {
      style: [...groups.style.values()],
      layout: [...groups.layout.values()],
      color: [...groups.color.values()],
      tone: [...groups.tone.values()],
    },
    items: items.filter(item => KINDS.includes(item.kind)).map(compact),
    curated,
  }

  const json = Buffer.from(JSON.stringify(index), 'utf8')
  return {
    index,
    json,
    gzip: gzipSync(json),
    etag: `"${createHash('sha1').update(json).digest('hex').slice(0, 16)}"`,
    byId,
    curatedById: new Map(curated.map(item => [item.id, item])),
  }
}

function state() {
  if (!cache) cache = build()
  return cache
}

export function getIndex() {
  return state().index
}

/** 索引的 gzip 版本，配合 ETag 给客户端；594 条素材约 30 KB。 */
export function getIndexPayload() {
  const { json, gzip, etag } = state()
  return { json, gzip, etag }
}

export function getItem(id) {
  return state().byId.get(id) || null
}

export function getCurated(id) {
  return state().curatedById.get(id) || null
}

/** 给拼装器用的取数函数：不存在就返回 null（由调用方决定报什么错）。 */
export function lookup(kind, id) {
  const item = getItem(id)
  if (!item || item.kind !== kind) return null
  return item
}

export function stats() {
  const { index } = state()
  return { counts: index.counts, version: index.version }
}
