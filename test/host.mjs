// 手工验证宿主半边：起一个本地 http 服务器挂上插件的路由，跑一遍接口
import http from 'node:http'
import { apply } from '../lib/index.js'

const routes = []
const tools = []
let rejection = undefined
const ctx = {
  effect(fn) { const d = fn(); return () => d && d() },
  webServer: { register(route) { routes.push(route); return () => {} } },
  tools: { register(tool) { tools.push(tool); return () => {} } },
  connection: { requestRejection() { return rejection } },
}
apply(ctx)
console.log('routes:', routes.map((r) => `${r.kind}:${r.path}`), 'tools:', tools.map((t) => t.name))

const server = http.createServer((req, res) => routes[0].handler(req, res))
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const port = server.address().port
const base = `http://127.0.0.1:${port}/image-studio`

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json, text }
}

const status = await call('GET', '/api/status')
console.log('status:', status.status, JSON.stringify({
  provider: status.json?.provider,
  account: status.json?.account ? { ok: status.json.account.ok, email: status.json.account.email, plan: status.json.account.plan, binary: !!status.json.account.binary } : null,
  quota: status.json?.quota ? { plan: status.json.quota.plan, windows: status.json.quota.windows } : null,
  quotaError: status.json?.quotaError,
  providers: (status.json?.providers || []).map((p) => `${p.id}:${p.state}`),
}, null, 2))

const mode = process.argv[2] || 'quick'

// 鉴权：Connection 拒绝时必须直接返回 401/403，不能进入业务逻辑
rejection = 403
const denied = await call('GET', '/api/status')
console.log('denied(403) ->', denied.status, denied.text)
rejection = 401
const denied401 = await call('GET', '/api/status')
console.log('denied(401) ->', denied401.status, denied401.text)
rejection = undefined

if (mode === 'full') {
  const gen = await call('POST', '/api/generate', { prompt: '极简海报：深蓝夜空下的一盏台灯，扁平插画', size: '1024x1536' })
  console.log('generate:', gen.status, JSON.stringify(gen.json ? (gen.json.ok ? { ok: true, image: gen.json.image, usage: gen.json.usage } : gen.json) : gen.text.slice(0, 200), null, 2))
  if (gen.json?.ok) {
    const img = await fetch(`http://127.0.0.1:${port}${gen.json.image.url}`)
    console.log('media:', img.status, img.headers.get('content-type'), (await img.arrayBuffer()).byteLength, 'bytes')
    const hist = await call('POST', '/api/history', {})
    console.log('history:', hist.status, (hist.json?.images || []).length, '张')
    const bad = await call('POST', '/api/generate', { prompt: '' })
    console.log('empty prompt ->', bad.status, bad.json?.error?.code)
    const settings = await call('POST', '/api/settings', { proxy: 'auto', defaultSize: 'auto' })
    console.log('settings ->', settings.status, settings.json?.settings?.proxy)
  }
}
server.close()
