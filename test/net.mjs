// 手工验证：node test/net.mjs
import { request, resolveProxy } from '../lib/net.js'
const { proxy, source } = await resolveProxy('auto')
console.log('proxy:', proxy, 'source:', source)
let t = Date.now()
try {
  const r1 = await request('https://chatgpt.com/backend-api/', { proxy, headers: { accept: 'application/json' }, timeoutMs: 20000 })
  console.log('chatgpt.com ->', r1.status, r1.headers['content-type'], JSON.stringify(r1.text.slice(0, 120)), Date.now() - t, 'ms')
} catch (e) { console.log('chatgpt ERR', e.code, e.message) }
t = Date.now()
try {
  const r2 = await request('https://api.openai.com/v1/models', { proxy, timeoutMs: 20000 })
  console.log('api.openai.com ->', r2.status, r2.headers['content-type'], r2.text.slice(0, 80), Date.now() - t, 'ms')
} catch (e) { console.log('openai ERR', e.code, e.message) }
t = Date.now()
try {
  const r3 = await request('https://chatgpt.com/backend-api/', { proxy: null, timeoutMs: 8000 })
  console.log('direct ->', r3.status, Date.now() - t, 'ms')
} catch (e) { console.log('direct ERR (预期失败)', e.code, e.message, Date.now() - t, 'ms') }
