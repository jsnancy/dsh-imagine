// 模板库半边的手工验证：起本地 http 服务器挂上插件路由，跑一遍接口
// 用法：node test/templates.mjs [--net]   （--net 会真的去 CDN 拉一张图）
import http from 'node:http'
import { apply } from '../lib/index.js'

const routes = []
// 假的模型服务：只为跑通 /templates/assist 的解析分支，不联网。
const fakeLlm = {
  async listProviders() { return ['fake'] },
  async listModels() { return ['fake-model'] },
  async *stream() {
    yield { type: 'text', text: '{"layout":"IG-032","style":"FA-021","color":"C-01","tone":"T-04","ratio":"4:5","mode":"graphic-text","reason":"信息图配水彩最稳"}' }
  },
}
const ctx = {
  effect(fn) { const d = fn(); return () => d && d() },
  webServer: { register(route) { routes.push(route); return () => {} } },
  tools: { register() { return () => {} } },
  connection: { requestRejection() { return undefined } },
  get(name) { return name === 'llm' ? fakeLlm : undefined },
}
apply(ctx)

const server = http.createServer((req, res) => routes[0].handler(req, res))
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/image-studio`

let failed = 0
function check(label, ok, extra) {
  if (ok) console.log('  ✓', label)
  else {
    failed += 1
    console.log('  ✗', label, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400))
  }
}

async function call(method, path, body, headers) {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const buf = Buffer.from(await res.arrayBuffer())
  let json = null
  try { json = JSON.parse(buf.toString('utf8')) } catch {}
  return { status: res.status, headers: res.headers, json, bytes: buf.length }
}

console.log('routes:', routes.map((r) => `${r.kind}:${r.path}`))

// ── 索引 ────────────────────────────────────────────────────────────────
console.log('\nindex')
const index = await call('GET', '/templates/index')
check('200', index.status === 200, index.json)
check('带 etag', Boolean(index.headers.get('etag')), index.headers.get('etag'))
check('counts 齐全', index.json && index.json.counts && index.json.counts.total === 594, index.json && index.json.counts)
check('60 个精选场景', index.json && index.json.curated && index.json.curated.length === 60, index.json && index.json.curated && index.json.curated.length)
check('素材 594 条', index.json && index.json.items && index.json.items.length === 594, index.json && index.json.items && index.json.items.length)
check('不含正文（体积可控）', index.bytes < 400 * 1024, index.bytes)
const again = await call('GET', '/templates/index', null, { 'if-none-match': index.headers.get('etag') })
check('etag 命中 304', again.status === 304, again.status)
const gz = await fetch(base + '/templates/index', { headers: { 'accept-encoding': 'gzip' } })
check('gzip 压缩', gz.headers.get('content-encoding') === 'gzip', gz.headers.get('content-encoding'))
const first = index.json.items[0]
check('条目字段', Boolean(first.id && first.kind && first.title && first.cover), first)

// ── 单条 ────────────────────────────────────────────────────────────────
console.log('\nitem')
const ig = await call('GET', '/templates/item/IG-032')
check('IG-032 200', ig.status === 200, ig.json)
check('IG-032 中文正文', ig.json && ig.json.item && ig.json.item.body && ig.json.item.body.zh.length > 200, ig.json && ig.json.item && ig.json.item.body.zh.slice(0, 30))
check('IG-032 英文正文', ig.json && ig.json.item && ig.json.item.body && ig.json.item.body.en.length > 200)
const style = await call('GET', '/templates/item/FA-021')
check('FA-021 带作者', style.json && style.json.item && /Mari Andrew/.test(JSON.stringify(style.json.item)), style.json && style.json.item && style.json.item.credit)
const missing = await call('GET', '/templates/item/ZZ-999')
check('未知 ID 404', missing.status === 404, missing.status)

// ── 拼装 ────────────────────────────────────────────────────────────────
console.log('\ncompose')
const theme = '为什么搬家以后，我反而更常做早餐了'
const composed = await call('POST', '/templates/compose', {
  layout: 'SC-014',
  style: 'FA-021',
  color: 'C-01',
  tone: 'T-04',
  ratio: '3:4',
  mode: 'graphic-text',
  theme,
})
const prompt = (composed.json && composed.json.prompt) || ''
check('200', composed.status === 200, composed.json)
check('包含作者', /Mari Andrew/.test(prompt))
check('包含主题', prompt.includes(theme))
check('包含画风特征', prompt.includes('水彩'))
check('主题色只出现一次前缀', (prompt.match(/主题色：/g) || []).length === 1, (prompt.match(/主题色：/g) || []).length)
check('包含排版图型', prompt.includes('SC-014'))
check('包含画幅比例', prompt.includes('3:4'))
check('长度落在 500–900', prompt.length > 500 && prompt.length < 900, prompt.length)
check('refs 回填', composed.json && composed.json.refs && composed.json.refs.layout === 'SC-014', composed.json && composed.json.refs)

const pure = await call('POST', '/templates/compose', { style: 'FA-021', mode: 'pure-image', theme })
check('纯图模式不含排版段', pure.status === 200 && !/排版图型/.test(pure.json.prompt), pure.json && pure.json.prompt.slice(0, 80))
const ecommerce = await call('POST', '/templates/compose', { layout: 'EC-008', theme })
check('电商模式不带图文后缀', ecommerce.status === 200 && !/文字参与构图/.test(ecommerce.json.prompt), ecommerce.json && ecommerce.json.mode)
const bad = await call('POST', '/templates/compose', { layout: 'XX-000', theme })
check('非法版式 400', bad.status === 400 && bad.json && bad.json.error && bad.json.error.code === 'bad-template', bad.json)
const noTheme = await call('POST', '/templates/compose', { layout: 'SC-014' })
check('空主题回落到占位符', noTheme.status === 200 && /请在此输入画面主题/.test(noTheme.json.prompt), noTheme.json && noTheme.json.prompt.slice(0, 40))

// ── 封面与远程素材 ──────────────────────────────────────────────────────
console.log('\nasset')
const cover = await call('GET', '/templates/cover/IG-032.webp')
check('内置封面 200', cover.status === 200, cover.status)
check('cover content-type', cover.headers.get('content-type') === 'image/webp', cover.headers.get('content-type'))
check('cover 有长度', cover.bytes > 5000, cover.bytes)
const badCover = await call('GET', '/templates/cover/..%2F..%2Fpackage.json')
check('封面越权 400/404', badCover.status === 400 || badCover.status === 404, badCover.status)
const badAsset = await call('GET', '/templates/asset?path=../../etc/passwd')
check('素材白名单 400', badAsset.status === 400, badAsset.status)
if (process.argv.includes('--net')) {
  const remote = await call('GET', '/templates/asset?path=colors/C-01.webp')
  check('远程素材 200', remote.status === 200, remote.status)
  check('远程素材 webp', remote.headers.get('content-type') === 'image/webp', remote.headers.get('content-type'))
  if (remote.status === 200) console.log('    cache:', remote.headers.get('x-asset-cache'), remote.bytes, 'bytes')
}

// ── 缓存状态 ────────────────────────────────────────────────────────────
console.log('\nstatus')
const status = await call('GET', '/templates/status')
check('200', status.status === 200, status.json)
check('插件版本 0.5.0', status.json && status.json.version === '0.5.0', status.json && status.json.version)
check('缓存字段齐全', status.json && typeof status.json.cached === 'number' && typeof status.json.assets === 'number', status.json && { cached: status.json.cached, assets: status.json.assets })
check('同步状态可查', status.json && status.json.sync && status.json.sync.running === false, status.json && status.json.sync)
check('能力状态可查', status.json && status.json.capability && typeof status.json.capability.state === 'string', status.json && status.json.capability)
check('素材库版本', status.json && /^\d+\.\d+\.\d+$/.test(status.json.templateVersion || ''), status.json && status.json.templateVersion)
check('counts', status.json && status.json.counts && status.json.counts.total === 594, status.json && status.json.counts)
if (process.argv.includes('--net')) {
  const again2 = await call('GET', '/templates/asset?path=colors/C-01.webp')
  check('二次命中磁盘缓存', ['disk', 'hit', 'memory'].includes(again2.headers.get('x-asset-cache')), again2.headers.get('x-asset-cache'))
}

// ── 风格融合 ────────────────────────────────────────────────────────────
console.log('\nfusion')
const fused = await call('POST', '/templates/compose', {
  style: 'FA-021',
  fusion: { character: 'FB-012', scene: 'FH-002' },
  theme,
})
const fusedPrompt = (fused.json && fused.json.prompt) || ''
check('融合 200', fused.status === 200, fused.json)
check('含融合原则', fusedPrompt.includes('融合原则'), fusedPrompt.slice(0, 60))
check('含角色画风', fusedPrompt.includes('FB-012'))
check('含场景画风', fusedPrompt.includes('FH-002'))
check('refs 带融合', fused.json && fused.json.refs && fused.json.refs.character === 'FB-012' && fused.json.refs.scene === 'FH-002', fused.json && fused.json.refs)
const badFusion = await call('POST', '/templates/compose', { style: 'FA-021', fusion: { character: 'C-01' }, theme })
check('融合里放非画风 400', badFusion.status === 400 && badFusion.json.error.code === 'bad-template', badFusion.json)

// ── 批量导出 ────────────────────────────────────────────────────────────
console.log('\nexport')
const exported = await call('POST', '/templates/export', {
  name: 'test-bundle',
  items: [
    { id: 'CT-01', title: '三分钟读懂一个概念', template: 'CT-01 · IG-032', params: { layout: 'IG-032', ratio: '4:5' }, prompt: prompt || 'placeholder prompt' },
    { id: 'IG-032', title: '手绘编辑式知识信息图', prompt: '第二条提示词' },
  ],
})
check('导出 200', exported.status === 200, exported.json)
check('导出条数', exported.json && exported.json.count === 2, exported.json && exported.json.count)
check('导出路径在 exports/', Boolean(exported.json && /exports/.test(exported.json.path)), exported.json && exported.json.path)
const emptyExport = await call('POST', '/templates/export', { items: [] })
check('空导出 400', emptyExport.status === 400, emptyExport.status)

// ── AI 辅助设计 ────────────────────────────────────────────────────────
console.log('\nassist')
const assist = await call('POST', '/templates/assist', { theme })
check('assist 200', assist.status === 200, assist.json)
check('assist 只回参数', assist.json && assist.json.params && assist.json.params.layout === 'IG-032' && assist.json.params.style === 'FA-021', assist.json && assist.json.params)
check('assist 不含正文', assist.json && !('prompt' in assist.json.params), assist.json && assist.json.params)
const noAssistTheme = await call('POST', '/templates/assist', {})
check('assist 空主题 400', noAssistTheme.status === 400, noAssistTheme.status)

// ── 缓存清理 ────────────────────────────────────────────────────────────
console.log('\ncache')
const cleared = await call('POST', '/templates/cache')
check('清理 200', cleared.status === 200, cleared.json)
check('清理后 cached 归零', cleared.json && cleared.json.cached === 0, cleared.json && cleared.json.cached)

// ── 参考图 data URL 校验 ────────────────────────────────────────────────
console.log('\nreference')
const badRef = await call('POST', '/api/generate', { prompt: 'x', reference: 'data:text/plain;base64,AAAA' })
check('非法参考图 400', badRef.status === 400 && badRef.json.error.code === 'bad-reference', badRef.json)

server.close()
console.log(failed ? `\nFAILED: ${failed}` : '\nTEMPLATES OK')
process.exit(failed ? 1 : 0)
