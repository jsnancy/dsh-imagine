// 浏览器半静态渲染冒烟测试：用最小 React 与占位 DOM 执行一遍 client.js，
// 调用 apply() 并渲染一次面板，捕获渲染期异常（未定义变量、hook 误用等）。
// 不跑网络与副作用，真实渲染仍以 GUI 验证为准。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8')

const fakeReact = {
  createElement(type, props, ...children) {
    const flat = []
    const push = (c) => {
      if (Array.isArray(c)) c.forEach(push)
      else if (c === null || c === undefined || c === false || c === true) return
      else flat.push(c)
    }
    children.forEach(push)
    return { type, props: { ...(props || {}), children: flat } }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useRef(value) {
    return { current: value }
  },
  useEffect() {},
  useLayoutEffect() {},
  useMemo(fn) {
    return fn()
  },
  useCallback(fn) {
    return fn
  },
  Fragment: 'Fragment',
}

const created = []

function fakeElement(tag) {
  return {
    tagName: tag,
    dataset: {},
    style: {},
    textContent: '',
    children: [],
    appendChild(child) {
      this.children.push(child)
    },
    removeChild() {},
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    remove() {},
    click() {},
    focus() {},
  }
}

globalThis.document = {
  head: fakeElement('head'),
  body: fakeElement('body'),
  documentElement: fakeElement('html'),
  querySelector: () => null,
  createElement(tag) {
    const element = fakeElement(tag)
    created.push(element)
    return element
  },
  addEventListener() {},
  removeEventListener() {},
}

globalThis.window = {
  __ModuleLoader__: {
    load(entry) {
      globalThis.window.__entry = entry
    },
  },
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  location: { origin: 'http://127.0.0.1:1', href: 'http://127.0.0.1:1/' },
  navigator: { clipboard: { writeText: async () => {} } },
  open() {},
}
globalThis.navigator = globalThis.window.navigator

let lang = 'zh'
let registered = []
let components = new Map()

const ctx = {
  inject(deps, callback) {
    const injected = {}
    injected.on = () => () => {}
    injected.effect = () => {}
    injected.get = () => undefined
    for (const dep of deps) {
      if (dep === 'locale') {
        injected.locale = {
          getSnapshot: () => ({ active: lang }),
          on: () => () => {},
          off() {},
        }
      } else injected[dep] = {}
    }
    callback(injected)
    return () => {}
  },
  on: () => () => {},
  effect(fn) {
    if (typeof fn === 'function') fn()
    return () => {}
  },
  get: () => undefined,
  slots: {
    inject(name, callback) {
      registered.push(`inject:${name}`)
      callback()
      return () => {}
    },
    register(spec, component) {
      registered.push(`register:${spec.name}${spec.key ? '#' + spec.key : ''}`)
      if (typeof component === 'function') components.set(spec.name + (spec.key ? '#' + spec.key : ''), component)
      return () => {}
    },
  },
}

const wrapped = new Function(`
  var window = globalThis.window
  var document = globalThis.document
  var navigator = globalThis.navigator
  var require = globalThis.__requireImpl__
  var module = { exports: {} }
  var exports = module.exports
  ${source}
  return module.exports
`)

globalThis.__requireImpl__ = (name) => {
  if (name === 'react') return fakeReact
  throw new Error(`unexpected require: ${name}`)
}

wrapped()
const plugin = globalThis.window.__entry.factory(globalThis.__requireImpl__)
const cleanup = plugin.apply(ctx)

function flatten(node, out = []) {
  if (node === null || node === undefined || node === false || node === true) return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const child of node) flatten(child, out)
    return out
  }
  if (node.props) flatten(node.props.children, out)
  return out
}

let failures = 0
function render(name) {
  const component = components.get(name)
  if (!component) {
    console.log(`  ${name}: MISSING`)
    failures += 1
    return
  }
  try {
    const tree = component({})
    const texts = flatten(tree)
    console.log(`  ${name}: ok (${texts.length} text nodes, sample: ${texts.slice(0, 6).join(' | ')})`)
  } catch (err) {
    failures += 1
    console.log(`  ${name}: THREW ${err && err.message}`)
    if (err && err.stack) console.log(err.stack.split('\n').slice(0, 4).join('\n'))
  }
}

console.log('exports:', Object.keys(plugin).join(','))
console.log('registered:', registered.join(', '))
console.log('css tags created:', created.length)
console.log('render (zh):')
for (const name of components.keys()) render(name)

lang = 'en'
console.log('render (en):')
for (const name of components.keys()) render(name)

if (typeof cleanup === 'function') cleanup()
console.log(failures === 0 ? 'SMOKE OK' : `SMOKE FAILURES: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
