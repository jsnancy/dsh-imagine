// 生图 / 额度 的 provider 注册表。本期只落地 Codex（ChatGPT 订阅），其余预留同构插槽。
import { readSettings } from './store.js'
import { resolveProxy, forgetDetectedProxy } from './net.js'
import { CodexError, findCodexBinary, readAccount, readRateLimits, summarizeQuota, generateImage, imageCapability } from './codex.js'

const QUOTA_TTL_MS = 60 * 1000

function note(zh, en) {
  return { zh, en }
}

/** Codex / ChatGPT 订阅适配器。 */
const codexAdapter = {
  id: 'codex',
  async context() {
    const settings = await readSettings()
    const { proxy, source } = await resolveProxy(settings.proxy)
    return { settings, proxy, proxySource: source }
  },
  async account() {
    const account = await readAccount()
    const settings = await readSettings()
    let binary = null
    let binaryError = null
    try {
      binary = findCodexBinary(settings.codexPath)
    } catch (err) {
      binaryError = err.message
    }
    return { ...account, binary, binaryError }
  },
  async quota() {
    const { settings, proxy } = await this.context()
    const binary = findCodexBinary(settings.codexPath)
    const raw = await readRateLimits({ binary, proxy })
    return summarizeQuota(raw, { binary })
  },
  capability() {
    return imageCapability()
  },
  async generate({ prompt, size, background, reference }) {
    const { proxy } = await this.context()
    const result = await generateImage({ prompt, size, background, proxy, reference })
    return result
  },
}

/** 预留的 provider 槽位：以后接 Claude / WorkBuddy / Kimi 的订阅额度与生图。 */
const plannedAdapters = [
  {
    id: 'claude',
    title: note('Claude 订阅', 'Claude subscription'),
    note: note('等官方开放图片生成接口后接入', 'Waiting on an official image endpoint'),
  },
  {
    id: 'workbuddy',
    title: note('WorkBuddy 订阅', 'WorkBuddy subscription'),
    note: note('等接口开放后接入', 'Waiting on the provider API'),
  },
  {
    id: 'kimi',
    title: note('Kimi 订阅', 'Kimi subscription'),
    note: note('等接口开放后接入', 'Waiting on the provider API'),
  },
]

const adapters = new Map([[codexAdapter.id, codexAdapter]])

/** 面板/工具用的 provider 列表（可 JSON 序列化）。 */
export function listProviders() {
  const ready = [
    {
      id: 'codex',
      title: note('Codex · ChatGPT', 'Codex · ChatGPT'),
      state: 'ready',
      features: ['quota', 'image'],
      note: note('用 ChatGPT 订阅额度，不需要 API key', 'Uses the ChatGPT subscription, no API key'),
    },
  ]
  const planned = plannedAdapters.map((item) => ({
    id: item.id,
    title: item.title,
    state: 'planned',
    features: [],
    note: item.note,
  }))
  return [...ready, ...planned]
}

export function getAdapter(id) {
  return adapters.get(id) || adapters.get('codex')
}

let quotaCache = null

/** 额度读取（默认缓存 60 秒；force 时重新读）。 */
export async function getQuota({ force = false } = {}) {
  if (!force && quotaCache && Date.now() - quotaCache.at < QUOTA_TTL_MS) return { ...quotaCache.value, cached: true }
  const adapter = getAdapter('codex')
  try {
    const value = await adapter.quota()
    quotaCache = { at: Date.now(), value }
    return value
  } catch (err) {
    if (err && (err.code === 'proxy-connect' || err.code === 'connect' || err.code === 'connect-timeout')) {
      forgetDetectedProxy()
    }
    throw err
  }
}

export function clearQuotaCache() {
  quotaCache = null
}

export { CodexError }
