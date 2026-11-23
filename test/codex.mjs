// 手工验证：node test/codex.mjs [generatem]
import { readAccount, readRateLimits, summarizeQuota, findCodexBinary, generateImage } from '../lib/codex.js'
import { resolveProxy } from '../lib/net.js'

const { proxy } = await resolveProxy('auto')
console.log('proxy:', proxy)

const account = await readAccount()
console.log('account:', { ...account, authPath: account.authPath })
const bin = findCodexBinary('')
console.log('codex binary:', bin)

const t0 = Date.now()
try {
  const raw = await readRateLimits({ binary: bin, proxy, timeoutMs: 60000 })
  console.log('quota raw keys:', Object.keys(raw || {}))
  console.log('quota:', JSON.stringify(summarizeQuota(raw, { binary: bin }), null, 2))
  console.log('quota ms:', Date.now() - t0)
} catch (e) {
  console.log('QUOTA ERR', e.code, e.message)
}

if (process.argv[2] === 'generate') {
  const t1 = Date.now()
  try {
    const out = await generateImage({ prompt: '一只戴眼镜的橘猫坐在书桌前看代码，扁平插画风格', size: '1024x1536', proxy })
    console.log('image bytes:', out.buffer.length, 'size:', out.size, 'quality:', out.quality, 'usage:', JSON.stringify(out.usage), 'ms:', Date.now() - t1)
    const { writeFile } = await import('node:fs/promises')
    await writeFile('/tmp/test-image.png', out.buffer)
    console.log('saved /tmp/test-image.png')
  } catch (e) {
    console.log('GEN ERR', e.code, e.message)
  }
}
