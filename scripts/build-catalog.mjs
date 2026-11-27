#!/usr/bin/env node
/**
 * 从 handraw-style 仓库构建内置素材索引。
 *
 * 输入（上游，不随包分发）：
 *   $HANDRAW_SRC/skills/handdraw-style-prompter/references/{styles,layouts,colors,tones}.json
 *   $HANDRAW_SRC/skills/handdraw-style-prompter/references/layouts/<ID>.md
 *   $HANDRAW_SRC/images/layouts/<dir>/<ID>.webp
 * 输入（本仓库）：docs/design/curated-60.md（60 个精选场景配方表）
 *
 * 输出（随包分发）：
 *   lib/data/catalog.json   594 条素材（含提示词正文）
 *   lib/data/curated.json   60 个精选场景
 *   lib/data/meta.json      版本与署名
 *   lib/data/img/<ID>.webp  精选场景用到的版式封面（离线首屏）
 *
 * 用法：
 *   node scripts/build-catalog.mjs                 # 默认读 /tmp/handraw-style
 *   HANDRAW_SRC=/path/to/handraw-style node scripts/build-catalog.mjs
 */
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.env.HANDRAW_SRC || '/tmp/handraw-style')
const REF = join(SRC, 'skills/handdraw-style-prompter/references')
const OUT = join(ROOT, 'lib/data')
const IMG = join(OUT, 'img')
const CURATED_MD = join(ROOT, 'docs/design/curated-60.md')

const LICENSE_URL = 'https://github.com/yang0/handraw-style'

const LAYOUT_LABELS = {
  'social-card': '社媒卡',
  infographic: '信息图',
  'comic-storyboard': '漫画分镜',
  'ip-character': 'IP 设计',
  ecommerce: '电商',
}

const RATIOS = [
  ['3:4', 3 / 4],
  ['2:3', 2 / 3],
  ['9:16', 9 / 16],
  ['1:1', 1],
  ['4:3', 4 / 3],
  ['3:2', 3 / 2],
  ['16:9', 16 / 9],
  ['21:9', 21 / 9],
  ['4:5', 4 / 5],
]

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (err) {
    fail(`读不到 ${path}：${err.message}`)
  }
}

/** 读 webp 原始像素尺寸：只为算「建议比例」，不引入依赖。 */
function webpSize(buf) {
  if (buf.length < 30 || buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return null
  const kind = buf.toString('latin1', 12, 16)
  if (kind === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
  if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  if (kind === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  return null
}

function nearestRatio(size) {
  if (!size || !size.width || !size.height) return null
  const value = size.width / size.height
  let best = RATIOS[0]
  for (const entry of RATIOS) if (Math.abs(entry[1] - value) < Math.abs(best[1] - value)) best = entry
  return best[0]
}

/** 把上游 markdown 里的 <!-- zh --> / <!-- en --> 拆成两段正文。 */
function splitBilingual(md) {
  const zhMatch = /<!--\s*zh\s*-->([\s\S]*?)(?=<!--\s*en\s*-->|$)/i.exec(md)
  const enMatch = /<!--\s*en\s*-->([\s\S]*)$/i.exec(md)
  const clean = value => (value || '').replace(/\s+/g, ' ').trim()
  return { zh: clean(zhMatch && zhMatch[1]), en: clean(enMatch && enMatch[1]) }
}

/** 解析 docs/design/curated-60.md 的配方表。 */
function parseCurated(md) {
  const domains = {
    A: ['knowledge', '知识科普'],
    B: ['work', '职场 · 商业'],
    C: ['life', '生活方式 · 情绪'],
    D: ['commerce', '产品 · 电商'],
    E: ['ip', 'IP · 品牌'],
    F: ['story', '漫画 · 叙事'],
  }
  const rows = []
  let section = null
  for (const line of md.split(/\r?\n/)) {
    const head = /^##\s+([A-F])\.\s*(.+?)\s*$/.exec(line)
    if (head) {
      section = { key: head[1], domain: domains[head[1]][0], label: domains[head[1]][1] }
      continue
    }
    if (!section || !line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    if (cells.length < 9 || !/^CT-\d{2}$/.test(cells[0])) continue
    const [id, title, layout, style, color, tone, ratio, mode, themeHint] = cells
    rows.push({
      id,
      domain: section.domain,
      domainLabel: section.label,
      title,
      layout: (layout.match(/^[A-Z]{2}-\d{3}/) || [])[0],
      style: (style.match(/^[A-Z]{2}-\d{3}/) || [])[0],
      color: (color.match(/^C-\d{2}/) || [])[0],
      tone: (tone.match(/^T-\d{2}/) || [])[0],
      ratio,
      mode: mode.includes('纯图') ? 'pure-image' : 'graphic-text',
      themeHint,
    })
  }
  return rows
}

async function main() {
  if (!existsSync(REF)) fail(`找不到上游数据目录：${REF}（用 HANDRAW_SRC 指定 handraw-style 仓库根目录）`)

  const version = await readJson(join(REF, 'version.json')).then(row => row.version, () => null)
  const styles = await readJson(join(REF, 'styles.json'))
  const layouts = await readJson(join(REF, 'layouts.json'))
  const colors = await readJson(join(REF, 'colors.json'))
  const tones = await readJson(join(REF, 'tones.json'))

  const items = []
  const byId = new Map()

  for (const row of styles) {
    const item = {
      id: row.number,
      kind: 'style',
      title: row.generation_name,
      titleEn: row.generation_name,
      group: row.group,
      groupId: String(row.group || '').split(' ')[0],
      credit: row.reference || null,
      body: { zh: String(row.traits || '').trim() },
      cover: { remote: `individual/${row.number.slice(0, 2)}/${row.number}.webp` },
    }
    items.push(item)
    byId.set(item.id, item)
  }

  for (const row of layouts) {
    const promptPath = join(REF, row.prompt_file)
    let body = { zh: '', en: '' }
    if (existsSync(promptPath)) body = splitBilingual(await readFile(promptPath, 'utf8'))
    const remote = row.image.replace(/^\.\.\/\.\.\/\.\.\/images\//, '')
    const local = row.id + '.webp'
    const localPath = join(SRC, 'images', remote)
    const size = existsSync(localPath) ? webpSize(await readFile(localPath)) : null
    const item = {
      id: row.id,
      kind: 'layout',
      title: row.name,
      titleEn: row.name_en || row.name,
      category: row.category,
      categoryLabel: LAYOUT_LABELS[row.category] || row.category,
      keywords: row.keywords || [],
      ratio: nearestRatio(size),
      cover: { remote },
      body,
    }
    items.push(item)
    byId.set(item.id, item)
  }

  for (const row of colors) {
    items.push({
      id: row.id,
      kind: 'color',
      title: row.name_zh,
      titleEn: row.name_en,
      category: row.category,
      categoryLabel: row.category_zh,
      cover: { remote: row.image.replace(/^\.\.\/\.\.\/\.\.\/images\//, '') },
      body: { zh: String(row.prompt_zh || '').trim(), en: String(row.prompt_en || '').trim() },
    })
    byId.set(row.id, items[items.length - 1])
  }

  for (const row of tones) {
    items.push({
      id: row.id,
      kind: 'tone',
      title: row.name_zh,
      titleEn: row.name_en,
      category: row.category,
      categoryLabel: row.category_zh,
      cover: { remote: row.image.replace(/^\.\.\/\.\.\/\.\.\/images\//, '') },
      body: { zh: String(row.desc_zh || '').trim(), en: String(row.desc_en || '').trim() },
    })
    byId.set(row.id, items[items.length - 1])
  }

  // 精选场景：校验每个引用 ID 都存在，封面用版式官方示例图（离线内置）。
  const curatedRows = parseCurated(await readFile(CURATED_MD, 'utf8'))
  if (curatedRows.length !== 60) fail(`精选场景应当 60 条，解析到 ${curatedRows.length} 条`)

  const usedCovers = new Map()
  const curated = []
  const problems = []
  for (const row of curatedRows) {
    for (const key of ['layout', 'style', 'color', 'tone']) {
      if (!row[key]) problems.push(`${row.id} 的 ${key} 解析失败`)
      else if (!byId.has(row[key])) problems.push(`${row.id} 引用了不存在的 ${key}：${row[key]}`)
    }
    const layout = byId.get(row.layout)
    if (!layout) continue
    usedCovers.set(layout.id, layout.cover.remote)
    curated.push({
      id: row.id,
      domain: row.domain,
      domainLabel: row.domainLabel,
      title: row.title,
      themeHint: row.themeHint,
      layout: row.layout,
      style: row.style,
      color: row.color,
      tone: row.tone,
      ratio: row.ratio,
      mode: row.mode,
      cover: { local: `${layout.id}.webp` },
      chars: layout.body.zh.length,
    })
  }
  if (problems.length) fail(`精选场景校验失败：\n  ${problems.join('\n  ')}`)

  await rm(IMG, { recursive: true, force: true })
  await mkdir(IMG, { recursive: true })
  let coverBytes = 0
  for (const [layoutId, remote] of usedCovers) {
    const from = join(SRC, 'images', remote)
    if (!existsSync(from)) fail(`封面缺失：${from}`)
    const target = join(IMG, `${layoutId}.webp`)
    await copyFile(from, target)
    coverBytes += (await readFile(target)).length
  }

  const payload = { version: 1, generatedAt: new Date().toISOString(), items }
  await writeFile(join(OUT, 'catalog.json'), JSON.stringify(payload), 'utf8')
  await writeFile(
    join(OUT, 'curated.json'),
    JSON.stringify({ version: 1, source: { repo: LICENSE_URL, version, author: 'yang0' }, items: curated }, null, 1),
    'utf8',
  )
  await writeFile(
    join(OUT, 'meta.json'),
    JSON.stringify(
      {
        version,
        author: 'yang0',
        repo: LICENSE_URL,
        license: 'MIT (with attribution requirement)',
        builtAt: new Date().toISOString(),
        counts: {
          style: items.filter(item => item.kind === 'style').length,
          layout: items.filter(item => item.kind === 'layout').length,
          color: items.filter(item => item.kind === 'color').length,
          tone: items.filter(item => item.kind === 'tone').length,
          curated: curated.length,
        },
      },
      null,
      1,
    ),
    'utf8',
  )

  const catalogBytes = (await readFile(join(OUT, 'catalog.json'))).length
  const digest = createHash('sha1').update(JSON.stringify(items)).digest('hex').slice(0, 12)
  console.log(`✓ 素材 ${items.length} 条（${(catalogBytes / 1024).toFixed(0)} KB，digest ${digest}）`)
  console.log(`✓ 精选场景 ${curated.length} 个，封面 ${usedCovers.size} 张（${(coverBytes / 1024 / 1024).toFixed(1)} MB）`)
  console.log(`✓ 输出目录 ${OUT}`)
}

await main()
