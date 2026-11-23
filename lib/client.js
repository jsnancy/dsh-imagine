// 生图工坊 · 浏览器半边：侧栏入口 + 主区域面板。
// 面板直接打同源的 /image-studio/api/*（宿主半注册的 prefix 路由），图片走 /image-studio/media/<id>.<ext>。
window.__ModuleLoader__.load({
  id: 'dsh-imagine',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const React = require('react')
    const h = React.createElement

    const PANEL = 'image-studio'
    const API = '/image-studio'

    // ── 文案 ──────────────────────────────────────────────────────────────
    const TEXT = {
      zh: {
        title: '生图工坊',
        subtitle: '用你已有的 Codex 订阅额度生图',
        account: '订阅账号',
        plan: '套餐',
        signedIn: '已连接',
        signedOut: '未连接',
        quota: '订阅额度',
        quotaUsed: '已用 {percent}%',
        quotaResets: '{when}后重置',
        quotaResetAt: '{time} 重置',
        quotaWindowWeekly: '每周额度',
        quotaWindowDaily: '每日额度',
        quotaWindowHours: '{hours} 小时额度',
        quotaWindowMinutes: '{minutes} 分钟额度',
        quotaUnavailable: '额度读取失败',
        refresh: '刷新',
        refreshQuota: '刷新额度',
        refreshing: '刷新中…',
        resetCredits: '另有 {count} 次额度重置可用',
        credits: '额外额度余额 {balance}',
        prompt: '画面描述',
        promptPlaceholder: '描述你想要的画面：主体、构图、风格、氛围。例如「一只戴眼镜的橘猫在书桌前写代码，扁平插画风格，暖色调」',
        size: '画布',
        sizeAuto: '自动（推荐）',
        sizePortrait: '竖版 1024×1536',
        sizeLandscape: '横版 1536×1024',
        sizeSquare: '方形 1024×1024',
        sizeHint: '模型可能按画面内容微调尺寸',
        background: '背景',
        bgOpaque: '完整画面',
        bgTransparent: '透明背景 PNG',
        generate: '生成图片',
        generating: '正在画…',
        generatingHint: '已提交给 Codex，通常 15–40 秒出图',
        cancel: '取消',
        result: '本次结果',
        resultEmpty: '生成的图片会出现在这里',
        examples: '试试这些',
        history: '历史',
        historyEmpty: '还没有生成过图片。写一句描述，点「生成图片」。',
        delete: '删除',
        reveal: '在访达中显示',
        download: '下载',
        copyPrompt: '用这条描述',
        copied: '描述已填入输入框',
        open: '查看大图',
        close: '关闭',
        settings: '设置',
        settingsTitle: '连接设置',
        proxy: '代理',
        proxyAuto: '自动（环境变量与本机端口探测）',
        proxyOff: '不用代理，直连',
        proxyCustom: '手动填写，例如 127.0.0.1:7890',
        proxyHint: '大陆网络通常要开代理才能连上 chatgpt.com。默认会先读 HTTPS_PROXY，再探测 Clash 等常见本地端口。',
        codexPath: 'Codex 可执行文件路径（留空自动查找）',
        save: '保存',
        saving: '保存中…',
        saved: '已保存',
        error: '出错了',
        retry: '重试',
        provider: '生图引擎',
        providerReady: '可用',
        providerPlanned: '敬请期待',
        providerNote: '后续会接入 Claude、WorkBuddy、Kimi 的订阅额度',
        firstRunTitle: '先连接 Codex 订阅账号',
        firstRunBody: '本插件读本机 Codex CLI 的登录状态。在终端运行一次 `codex login`，用 ChatGPT 账号登录后回来点「刷新额度」。',
        firstRunCheck: '重新检查',
        tokens: '{tokens} tokens',
        seconds: '{seconds} 秒',
        quality: '画质',
        quotaConsumed: '本次图片约消耗 {tokens} tokens',
        promptRequired: '先写一句画面描述',
        copyFailed: '没复制成功',
        resetsShort: '重置',
        resetCreditsShort: '可用重置',
        latest: '本次生成',
        workCount: '{count} 张',
        accountSettings: '账号与设置',
        railCreate: '创作',
        railAccount: '账号',
        railRecent: '最近作品',
        navGenerate: '生成图片',
        navHistory: '历史作品',
        navAccount: '账号与设置',
        navOutput: '输出目录',
        paths: '本机目录',
        lightboxHint: '点空白处关闭',
        language: '面板语言',
      },
      en: {
        title: 'Image Studio',
        subtitle: 'Draw with the Codex subscription you already have',
        account: 'Account',
        plan: 'Plan',
        signedIn: 'Connected',
        signedOut: 'Not connected',
        quota: 'Subscription quota',
        quotaUsed: '{percent}% used',
        quotaResets: 'Resets in {when}',
        quotaResetAt: 'Resets {time}',
        quotaWindowWeekly: 'Weekly window',
        quotaWindowDaily: 'Daily window',
        quotaWindowHours: '{hours} hour window',
        quotaWindowMinutes: '{minutes} minute window',
        quotaUnavailable: 'Could not read quota',
        refresh: 'Refresh',
        refreshQuota: 'Refresh quota',
        refreshing: 'Refreshing…',
        resetCredits: '{count} reset credit available',
        credits: 'Extra credits {balance}',
        prompt: 'Prompt',
        promptPlaceholder: 'Describe the image: subject, composition, style, mood. e.g. "an orange tabby cat in glasses writing code at a desk, flat illustration, warm palette"',
        size: 'Canvas',
        sizeAuto: 'Auto (recommended)',
        sizePortrait: 'Portrait 1024×1536',
        sizeLandscape: 'Landscape 1536×1024',
        sizeSquare: 'Square 1024×1024',
        sizeHint: 'The model may adjust the canvas to fit the scene',
        background: 'Background',
        bgOpaque: 'Full scene',
        bgTransparent: 'Transparent PNG',
        generate: 'Generate',
        generating: 'Drawing…',
        generatingHint: 'Sent to Codex — usually 15–40 seconds',
        cancel: 'Cancel',
        result: 'This run',
        resultEmpty: 'The generated image shows up here',
        examples: 'Try one of these',
        history: 'History',
        historyEmpty: 'Nothing yet. Write a prompt and hit Generate.',
        delete: 'Delete',
        reveal: 'Show in Finder',
        download: 'Download',
        copyPrompt: 'Use this prompt',
        copied: 'Prompt filled in',
        open: 'Open large',
        close: 'Close',
        settings: 'Settings',
        settingsTitle: 'Connection',
        proxy: 'Proxy',
        proxyAuto: 'Auto (env vars, then local port scan)',
        proxyOff: 'Direct, no proxy',
        proxyCustom: 'Custom, e.g. 127.0.0.1:7890',
        proxyHint: 'chatgpt.com needs a proxy on many networks. Auto reads HTTPS_PROXY first, then probes common local proxy ports such as Clash.',
        codexPath: 'Path to the codex binary (blank = auto-detect)',
        save: 'Save',
        saving: 'Saving…',
        saved: 'Saved',
        error: 'Something went wrong',
        retry: 'Retry',
        provider: 'Engine',
        providerReady: 'Ready',
        providerPlanned: 'Coming later',
        providerNote: 'Claude, WorkBuddy and Kimi subscriptions will plug in later',
        firstRunTitle: 'Connect a Codex subscription first',
        firstRunBody: 'This plugin reads the local Codex CLI login. Run `codex login` once in a terminal, sign in with your ChatGPT account, then hit Refresh quota.',
        firstRunCheck: 'Check again',
        tokens: '{tokens} tokens',
        seconds: '{seconds}s',
        quality: 'Quality',
        quotaConsumed: 'This image used about {tokens} tokens',
        promptRequired: 'Write a prompt first',
        copyFailed: 'Copy failed',
        resetsShort: 'Resets',
        resetCreditsShort: 'Free resets',
        latest: 'Latest',
        workCount: '{count} files',
        accountSettings: 'Account & settings',
        railCreate: 'Create',
        railAccount: 'Account',
        railRecent: 'Recent',
        navGenerate: 'Generate',
        navHistory: 'History',
        navAccount: 'Account & settings',
        navOutput: 'Output folder',
        paths: 'Local folder',
        lightboxHint: 'Click the backdrop to close',
        language: 'Panel language',
      },
    }

    const EXAMPLES = [
      {
        zh: '科技感海报：深蓝渐变夜空里浮着一颗发光水晶球，中心射出一束光，极简构图',
        en: 'Tech poster: a glowing crystal sphere floating in a deep blue gradient night sky, a beam of light through its center, minimal composition',
      },
      {
        zh: '一只戴黑框眼镜的橘猫坐在书桌前写代码，周围有咖啡杯和绿植，扁平插画风格，暖色调',
        en: 'An orange tabby cat in black-rimmed glasses writing code at a desk, coffee cup and plants around, flat illustration, warm palette',
      },
      {
        zh: '极简线条图标：一盏台灯，纯白背景，单色细描边，适合做应用图标',
        en: 'Minimal line icon of a desk lamp, pure white background, thin single-color outline, suitable as an app icon',
      },
    ]

    const SIZE_OPTIONS = ['auto', '1024x1536', '1536x1024', '1024x1024']

    // ── 语言 ──────────────────────────────────────────────────────────────
    function guessLang() {
      try {
        const nav = navigator.language || ''
        return /^zh/i.test(nav) ? 'zh' : 'en'
      } catch {
        return 'zh'
      }
    }

    let currentLang = guessLang()

    function t(key, vars) {
      const dict = TEXT[currentLang] || TEXT.zh
      let value = dict[key] || (TEXT.zh[key] || key)
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.split(`{${name}}`).join(String(replacement))
        }
      }
      return value
    }

    // ── 接口 ──────────────────────────────────────────────────────────────
    function pluginError(info) {
      const err = new Error((info && info.message) || '请求失败')
      err.code = (info && info.code) || 'error'
      return err
    }

    async function parseResponse(res) {
      const text = await res.text()
      let body = null
      try {
        body = text ? JSON.parse(text) : null
      } catch {
        body = null
      }
      if (!body) throw pluginError({ code: `http-${res.status}`, message: `HTTP ${res.status}` })
      if (body.ok === false) throw pluginError(body.error)
      return body
    }

    async function apiGet(path) {
      const res = await fetch(`${API}${path}`, { headers: { accept: 'application/json' }, cache: 'no-store' })
      return parseResponse(res)
    }

    async function apiPost(path, payload) {
      const res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload || {}),
      })
      return parseResponse(res)
    }

    // ── 格式化 ────────────────────────────────────────────────────────────
    const DAY = 86400000
    const HOUR = 3600000
    const MINUTE = 60000

    function formatDelay(ms) {
      const value = Math.max(0, ms)
      if (value < MINUTE) return currentLang === 'zh' ? '不到 1 分钟' : 'under a minute'
      if (value < HOUR) {
        const minutes = Math.round(value / MINUTE)
        return currentLang === 'zh' ? `${minutes} 分钟` : `${minutes}m`
      }
      if (value < DAY) {
        const hours = Math.floor(value / HOUR)
        const minutes = Math.round((value % HOUR) / MINUTE)
        return currentLang === 'zh' ? `${hours} 小时${minutes ? ` ${minutes} 分钟` : ''}` : `${hours}h${minutes ? ` ${minutes}m` : ''}`
      }
      const days = Math.floor(value / DAY)
      const hours = Math.round((value % DAY) / HOUR)
      return currentLang === 'zh' ? `${days} 天${hours ? ` ${hours} 小时` : ''}` : `${days}d${hours ? ` ${hours}h` : ''}`
    }

    function formatClock(ms) {
      if (!ms) return '—'
      try {
        return new Intl.DateTimeFormat(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(ms))
      } catch {
        return new Date(ms).toLocaleString()
      }
    }

    function formatBytes(bytes) {
      const value = Number(bytes) || 0
      if (value < 1024) return `${value} B`
      if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
      return `${(value / 1024 / 1024).toFixed(1)} MB`
    }

    function windowLabel(minutes) {
      const value = Number(minutes) || 0
      if (!value) return t('quota')
      if (value % 10080 === 0) return t('quotaWindowWeekly')
      if (value % 1440 === 0) return t('quotaWindowDaily')
      if (value % 60 === 0) return t('quotaWindowHours', { hours: value / 60 })
      return t('quotaWindowMinutes', { minutes: value })
    }

    function errorHint(code) {
      if (!code) return null
      if (code === 'codex-auth' || code === 'codex-auth-expired' || code === 'missing' || code === 'no-token') {
        return currentLang === 'zh'
          ? '在终端运行 `codex login`，用 ChatGPT 账号登录后再试。'
          : 'Run `codex login` in a terminal and sign in with your ChatGPT account.'
      }
      if (code === 'network' || code === 'connect-timeout' || code === 'proxy-connect' || code === 'proxy-timeout' || code === 'connect') {
        return currentLang === 'zh'
          ? '这台机器访问 chatgpt.com 需要代理，打开设置填代理地址（例如 127.0.0.1:7890）。'
          : 'This machine needs a proxy to reach chatgpt.com. Put your proxy address in Settings (e.g. 127.0.0.1:7890).'
      }
      if (code === 'quota') {
        return currentLang === 'zh' ? '订阅额度暂时用尽了，等额度重置后再试。' : 'The subscription quota is exhausted for now — retry after it resets.'
      }
      if (code === 'codex-missing') {
        return currentLang === 'zh'
          ? '没找到 codex 可执行文件：装上 Codex CLI 或 ChatGPT 桌面版，也可以在设置里填绝对路径。'
          : 'No codex binary found. Install the Codex CLI or the ChatGPT app, or set the path in Settings.'
      }
      return null
    }

    // ── 样式 ──────────────────────────────────────────────────────────────
    const CSS = `
.isx-root{
  --isx-paper:var(--dsw-alias-bg-base,#fafaf8);
  --isx-paper-2:var(--dsw-alias-bg-layer-2,#f2f2f0);
  --isx-grey:var(--dsw-alias-bg-layer-3,#e8e8e6);
  --isx-ink:var(--dsw-alias-label-primary,#0a0a0a);
  --isx-text-2:var(--dsw-alias-label-secondary,#525252);
  --isx-text-3:var(--dsw-alias-label-tertiary,#737373);
  --isx-text-placeholder:var(--dsw-alias-label-dimmed,#a3a3a3);
  --isx-line-subtle:var(--dsw-alias-border-l1,#e0e0e0);
  --isx-line:var(--dsw-alias-border-l2,#d4d4d2);
  --isx-line-strong:var(--dsw-alias-border-l3,#a3a3a3);
  --isx-accent:#002fa7;
  --isx-accent-on:#ffffff;
  --isx-c2:#e8703a;
  --isx-c3:#9aa600;
  --isx-c4:#d6220f;
  --isx-halo:rgba(0,47,167,.10);
  --isx-font:'Inter','Noto Sans SC',-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',system-ui,sans-serif;
  --isx-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  --isx-ease:cubic-bezier(.2,.7,.2,1);
  --s1:2px;--s2:4px;--s3:8px;--s4:12px;--s5:16px;--s6:24px;--s7:32px;--s8:40px;--s9:48px;--s10:64px;--s12:96px;
}
.isx-root[data-scheme="dark"]{
  --isx-accent:#7d95ff;
  --isx-statline:.72;
  --isx-accent-on:#0a0d18;
  --isx-c2:#ff8f52;
  --isx-c3:#c3d13f;
  --isx-c4:#ff6f5f;
  --isx-halo:rgba(125,149,255,.14);
}
.isx-root,.isx-root *{box-sizing:border-box}
.isx-root{height:100%;overflow:hidden;background:var(--isx-paper);color:var(--isx-ink);font-family:var(--isx-font);font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
.isx-mono{font-family:var(--isx-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.isx-shell{display:flex;height:100%;min-height:0}

/* 左栏 */
.isx-rail{flex:none;display:flex;flex-direction:column;gap:var(--s2);width:212px;padding:var(--s6) var(--s4) var(--s5);border-right:1px solid var(--isx-line-subtle);overflow-y:auto;overflow-x:hidden}
.isx-brand{display:flex;align-items:center;gap:10px;padding:0 var(--s3) var(--s5)}
.isx-brandmark{position:relative;flex:none;width:34px;height:34px;border-radius:9px;overflow:hidden;background:var(--isx-paper-2)}
.isx-brandmark img{display:block;width:100%;height:100%;object-fit:cover}
.isx-brandmark::after{content:'';position:absolute;inset:-4px;border:1px solid var(--isx-line-subtle);pointer-events:none}
.isx-brandmark svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.isx-brandtext{min-width:0}
.isx-brandname{font-size:13.5px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isx-brandpkg{margin-top:1px;font-family:var(--isx-mono);font-size:9.5px;letter-spacing:.04em;color:var(--isx-text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isx-railgroup{margin-top:var(--s5);padding:0 var(--s3) var(--s2);font-family:var(--isx-mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--isx-text-placeholder)}
.isx-nav{position:relative;display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 var(--s3);border:0;background:transparent;color:var(--isx-text-2);font:inherit;font-size:13px;text-align:left;cursor:pointer;transition:background .18s var(--isx-ease),color .18s var(--isx-ease)}
.isx-nav::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:2px;background:transparent;transition:background .18s}
.isx-nav:hover{background:var(--isx-paper-2);color:var(--isx-ink)}
.isx-nav.is-on{background:var(--isx-ink);color:var(--isx-paper)}
.isx-nav.is-on::before{background:var(--isx-accent)}
.isx-nav svg{flex:none;width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.isx-nav .count{margin-left:auto;font-family:var(--isx-mono);font-size:10px;opacity:.65}
.isx-railthumbs{display:flex;gap:var(--s2);padding:0 var(--s3) var(--s2)}
.isx-railthumb{width:52px;height:38px;padding:0;border:1px solid var(--isx-line-subtle);background-size:cover;background-position:center;background-color:var(--isx-paper-2);cursor:pointer;transition:transform .22s var(--isx-ease),border-color .2s,box-shadow .22s}
.isx-railthumb:hover{transform:translateY(-2px) scale(1.05);border-color:var(--isx-ink);box-shadow:0 10px 20px -14px rgba(0,0,0,.6)}
.isx-railfoot{position:relative;margin-top:auto;padding:var(--s5) var(--s3) 0;border-top:1px solid var(--isx-line-subtle);font-family:var(--isx-mono);font-size:9.5px;line-height:1.9;letter-spacing:.03em;color:var(--isx-text-3);overflow-wrap:anywhere}
.isx-railfoot::after{content:'';position:absolute;left:var(--s3);top:-1px;width:34px;height:2px;background:linear-gradient(90deg,var(--isx-accent),var(--isx-c2))}
.isx-railfoot b{display:block;font-weight:400;color:var(--isx-text-2)}

/* 主区 */
.isx-main{flex:1;min-width:0;overflow-y:auto;padding:var(--s8) var(--s9) var(--s12);scroll-behavior:smooth}
.isx-inner{max-width:1080px;margin:0 auto}

/* 页头 */
.isx-head{position:relative;margin-bottom:var(--s8)}
.isx-head::before{content:'';position:absolute;left:-60px;top:-70px;width:360px;height:260px;background:radial-gradient(closest-side,var(--isx-halo),transparent);pointer-events:none}
.isx-headrow{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s5);flex-wrap:wrap}
.isx-eyebrow{display:inline-block;position:relative;padding:3px 8px;font-family:var(--isx-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--isx-text-2)}
.isx-eyebrow::before,.isx-eyebrow::after{content:'';position:absolute;top:0;bottom:0;width:5px;border:1px solid var(--isx-ink)}
.isx-eyebrow::before{left:0;border-right:0}
.isx-eyebrow::after{right:0;border-left:0}
.isx-head h1{margin:var(--s4) 0 0;font-size:2.35rem;font-weight:200;letter-spacing:-.03em;line-height:1.12}
.isx-head h1::after{content:'';display:block;width:46px;height:2px;margin-top:var(--s4);background:linear-gradient(90deg,var(--isx-accent),var(--isx-c2) 55%,var(--isx-c3))}
.isx-head p{margin:var(--s4) 0 0;max-width:46em;color:var(--isx-text-2);line-height:1.7}
.isx-headtools{display:flex;align-items:center;gap:var(--s5);padding-top:2px}
.isx-lang{display:inline-flex;align-items:center;gap:8px}
.isx-langopt{padding:0;border:0;background:transparent;font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--isx-text-placeholder);cursor:pointer;transition:color .16s}
.isx-langopt:hover,.isx-langopt.is-on{color:var(--isx-ink)}

/* 统计格 */
.isx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--isx-line-subtle);background:var(--isx-paper);margin-bottom:var(--s8)}
.isx-stat{position:relative;min-width:0;padding:var(--s5);border-left:1px solid var(--isx-line-subtle);transition:background .2s}
.isx-stat:first-child{border-left:0}
.isx-stat::before{content:'';position:absolute;left:-1px;top:-1px;right:0;height:2px;background:var(--isx-accent);opacity:.42;transition:opacity .2s}
.isx-stat:first-child::before{left:0}
.isx-stat:hover{background:var(--isx-paper-2)}
.isx-stat:hover::before{opacity:1}
.isx-stat:nth-child(2)::before{background:var(--isx-c2)}
.isx-stat:nth-child(3)::before{background:var(--isx-c3)}
.isx-stat:nth-child(4)::before{background:var(--isx-c4)}
.isx-stat .k{font-family:var(--isx-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--isx-text-3)}
.isx-stat .val{margin-top:var(--s4);font-size:26px;font-weight:300;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-stat .sub{margin-top:var(--s2);font-size:12px;color:var(--isx-text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* 区块 */
.isx-sec{margin-top:var(--s9);scroll-margin-top:var(--s6)}
.isx-sec-head{display:flex;align-items:baseline;gap:var(--s4);padding-bottom:var(--s3);margin-bottom:var(--s5);border-bottom:1px solid var(--isx-ink)}
.isx-sec-head .num{font-family:var(--isx-mono);font-size:12px;color:var(--isx-text-3)}
.isx-sec-head h2{margin:0;font-size:15px;font-weight:600}
.isx-sec-head .more{margin-left:auto;font-family:var(--isx-mono);font-size:11px;letter-spacing:.06em;color:var(--isx-text-3)}

/* 按钮 */
.isx-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;font:inherit;font-size:13px;font-weight:600;white-space:nowrap;background:var(--isx-ink);color:var(--isx-paper);border:1px solid var(--isx-ink);cursor:pointer;text-decoration:none;box-shadow:0 1px 0 rgba(0,0,0,.05);transition:transform .18s var(--isx-ease),background .18s,border-color .18s,color .18s,box-shadow .18s}
.isx-btn:hover{background:var(--isx-accent);border-color:var(--isx-accent);color:var(--isx-accent-on);transform:translateY(-1.5px);box-shadow:0 12px 24px -16px var(--isx-accent)}
.isx-btn:active{transform:translateY(0)}
.isx-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.isx-btn.is-ghost{background:var(--isx-paper);color:var(--isx-ink);border-color:var(--isx-line)}
.isx-btn.is-ghost:hover{border-color:var(--isx-ink);background:var(--isx-paper);color:var(--isx-ink);box-shadow:none;transform:translateY(-1.5px)}
.isx-btn.is-lg{height:38px;padding:0 20px;font-size:13.5px}
.isx-btn.is-accent{background:var(--isx-accent);border-color:var(--isx-accent);color:var(--isx-accent-on)}
.isx-btn.is-accent:hover{background:var(--isx-ink);border-color:var(--isx-ink);color:var(--isx-paper);box-shadow:0 12px 24px -16px rgba(0,0,0,.6)}
.isx-ibtn{width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--isx-line);background:var(--isx-paper);color:var(--isx-text-2);cursor:pointer;transition:transform .18s var(--isx-ease),color .15s,border-color .15s,background .15s}
.isx-ibtn:hover{border-color:var(--isx-ink);color:var(--isx-ink)}
.isx-ibtn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}

/* 提示词 */
.isx-promptbox{background:var(--isx-paper);border:1px solid var(--isx-line-subtle);transition:border-color .2s,box-shadow .25s}
.isx-promptbox:focus-within{border-color:var(--isx-line-strong);box-shadow:0 0 0 3px var(--isx-halo)}
.isx-prompt{display:block;width:100%;min-height:180px;padding:var(--s5) var(--s6);border:0;background:transparent;color:var(--isx-ink);font:inherit;font-size:15px;line-height:1.7;resize:vertical;outline:none}
.isx-prompt::placeholder{color:var(--isx-text-placeholder)}
.isx-promptfoot{display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:var(--s4) var(--s5);border-top:1px solid var(--isx-line-subtle)}
.isx-select{height:32px;padding:0 26px 0 10px;border:1px solid var(--isx-line);background-color:transparent;background-image:url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%276%27 viewBox=%270 0 10 6%27><path d=%27M1 1l4 4 4-4%27 fill=%27none%27 stroke=%27%238a8a8a%27 stroke-width=%271.4%27/></svg>");background-repeat:no-repeat;background-position:right 9px center;color:var(--isx-ink);font:inherit;font-size:13px;appearance:none;-webkit-appearance:none;cursor:pointer;transition:border-color .16s}
.isx-select:focus{outline:none;border-color:var(--isx-ink)}
.isx-grow{flex:1}
.isx-hint{font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.04em;color:var(--isx-text-3)}
.isx-promptfoot .isx-hint{flex:0 1 auto;min-width:0;white-space:normal;text-align:right;line-height:1.5;font-variant-numeric:tabular-nums}
.isx-examples{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2);margin-top:var(--s4)}
.isx-examples .isx-hint{margin-right:4px}
.isx-example{max-width:100%;height:26px;padding:0 10px;border:1px solid var(--isx-line);background:var(--isx-paper);color:var(--isx-text-2);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:transform .18s var(--isx-ease),border-color .16s,color .16s,background .16s}
.isx-example:hover{border-color:var(--isx-ink);color:var(--isx-ink);background:var(--isx-paper-2);transform:translateY(-1px)}

/* 提示条 */
.isx-alert{margin-top:var(--s4);padding:var(--s4) var(--s5);border:1px solid var(--isx-line);border-left:3px solid var(--isx-accent);background:var(--isx-paper-2);font-size:13px;color:var(--isx-text-2);line-height:1.65}
.isx-alert strong{display:block;margin-bottom:2px;color:var(--isx-ink);font-weight:600}
.isx-alert .isx-btn{margin-top:var(--s3)}

/* 作品网格 */
.isx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:var(--s4);perspective:1200px}
.isx-work{position:relative;display:flex;flex-direction:column;background:var(--isx-paper);border:1px solid var(--isx-line-subtle);transform-style:preserve-3d;transform:translateY(0) rotateX(calc(var(--tx,0) * -9deg)) rotateY(calc(var(--ty,0) * 9deg));transition:transform .35s var(--isx-ease),border-color .2s,box-shadow .35s;animation:isx-rise .5s var(--isx-ease) both;animation-delay:var(--d,0ms)}
.isx-work::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--isx-accent);opacity:0;transition:opacity .25s;z-index:4}
.isx-work:nth-child(3n+2)::before{background:var(--isx-c2)}
.isx-work:nth-child(3n+3)::before{background:var(--isx-c3)}
.isx-work:hover::before{opacity:1}
.isx-work:hover{border-color:var(--isx-ink);box-shadow:0 22px 44px -34px rgba(0,0,0,.55)}
.isx-work.is-new{border-color:var(--isx-accent)}
.isx-work.is-new .isx-thumb::before{content:'';position:absolute;left:0;top:0;width:0;height:0;border-top:22px solid var(--isx-accent);border-right:22px solid transparent;z-index:2}
.isx-thumb{position:relative;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(135deg,var(--isx-grey),var(--isx-paper-2))}
.isx-thumb img{display:block;width:100%;height:100%;object-fit:cover;cursor:zoom-in;transition:transform .6s var(--isx-ease),filter .3s}
.isx-work:hover .isx-thumb img{transform:scale(1.05)}
.isx-thumb::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 58%,rgba(0,0,0,.22));opacity:0;transition:opacity .3s;pointer-events:none}
.isx-work:hover .isx-thumb::after{opacity:1}
.isx-thumbacts{position:absolute;top:6px;right:6px;z-index:3;display:flex;gap:4px;opacity:0;transform:translateY(-3px);transition:opacity .22s,transform .22s var(--isx-ease)}
.isx-work:hover .isx-thumbacts{opacity:1;transform:none}
.isx-thumbacts .isx-ibtn{background:rgba(10,10,10,.62);border-color:transparent;color:#fff;backdrop-filter:blur(6px)}
.isx-thumbacts .isx-ibtn:hover{background:var(--isx-accent);border-color:var(--isx-accent);color:var(--isx-accent-on)}
.isx-work-body{padding:var(--s3) var(--s4)}
.isx-work-kicker{display:flex;align-items:center;gap:6px;font-family:var(--isx-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--isx-text-3);overflow:hidden;white-space:nowrap}
.isx-work-kicker .txt{overflow:hidden;text-overflow:ellipsis}
.isx-dot{flex:none;width:5px;height:5px;background:var(--isx-accent)}
.isx-work:nth-child(3n+2) .isx-dot{background:var(--isx-c2)}
.isx-work:nth-child(3n+3) .isx-dot{background:var(--isx-c3)}
.isx-work-title{margin-top:var(--s2);font-size:13px;line-height:1.5;color:var(--isx-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.isx-work-foot{display:flex;align-items:center;gap:var(--s2);padding:var(--s3) var(--s4);border-top:1px solid var(--isx-line-subtle);margin-top:auto;font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.04em;color:var(--isx-text-3);font-variant-numeric:tabular-nums}
.isx-work-foot .isx-grow{text-align:right}
.isx-empty{grid-column:1/-1;padding:var(--s8);border:1px dashed var(--isx-grey);background:var(--isx-paper);color:var(--isx-text-2);text-align:center;line-height:1.8;font-size:13px}
.isx-generating{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--s4);min-height:180px;padding:var(--s6);border:1px solid var(--isx-line-subtle);overflow:hidden;background:linear-gradient(100deg,var(--isx-paper-2) 18%,var(--isx-paper) 38%,var(--isx-paper-2) 58%);background-size:220% 100%;animation:isx-shimmer 1.9s linear infinite}
@keyframes isx-shimmer{from{background-position:130% 0}to{background-position:-90% 0}}
@keyframes isx-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.isx-genbar{position:relative;width:min(240px,70%);height:2px;background:var(--isx-line);overflow:hidden}
.isx-genbar i{position:absolute;top:0;bottom:0;width:40%;background:var(--isx-accent);animation:isx-slide 1.2s ease-in-out infinite}
@keyframes isx-slide{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}
.isx-note{font-size:12px;color:var(--isx-text-3)}

/* 账号与设置 */
.isx-two{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:var(--s4);align-items:start}
.isx-panel{padding:var(--s6);background:var(--isx-paper);border:1px solid var(--isx-line-subtle);transition:border-color .2s}
.isx-panel:hover{border-color:var(--isx-line)}
.isx-panel .k{font-family:var(--isx-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--isx-text-3)}
.isx-account{display:flex;align-items:center;gap:var(--s4);margin:var(--s4) 0 var(--s5)}
.isx-avatar{position:relative;display:grid;place-items:center;width:38px;height:38px;flex:none;background:linear-gradient(145deg,var(--isx-accent),color-mix(in srgb,var(--isx-accent) 50%,#000));color:var(--isx-accent-on);font-size:16px;font-weight:600;box-shadow:0 8px 20px -14px var(--isx-accent)}
.isx-email{font-size:15px;font-weight:600;overflow-wrap:anywhere}
.isx-plan{display:inline-block;margin-top:4px;padding:1px 7px;border:1px solid var(--isx-line-strong);font-family:var(--isx-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--isx-text-2)}
.isx-quota-row{display:flex;align-items:baseline;gap:var(--s3)}
.isx-quota-row .v{margin-left:auto;font-family:var(--isx-mono);font-size:13px;font-variant-numeric:tabular-nums}
.isx-bar{position:relative;height:6px;margin-top:var(--s3);background:var(--isx-grey);overflow:hidden}
.isx-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--isx-accent),var(--isx-c2));transition:width .7s var(--isx-ease)}
.isx-field{margin-top:var(--s5)}
.isx-field label{display:block;margin-bottom:6px;font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--isx-text-3)}
.isx-input{width:100%;height:34px;padding:0 10px;border:1px solid var(--isx-line);background:var(--isx-paper);color:var(--isx-ink);font:inherit;font-size:13px;transition:border-color .16s,box-shadow .2s}
.isx-input:focus{outline:none;border-color:var(--isx-ink);box-shadow:0 0 0 3px var(--isx-halo)}
.isx-path{margin-top:var(--s5);font-family:var(--isx-mono);font-size:10px;line-height:1.6;color:var(--isx-text-3);overflow-wrap:anywhere}
.isx-pills{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3)}
.isx-pill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border:1px solid var(--isx-line);background:var(--isx-paper);font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--isx-text-2);transition:border-color .16s,color .16s}
.isx-pill.is-on{background:var(--isx-ink);border-color:var(--isx-ink);color:var(--isx-paper)}
.isx-pill.is-planned{color:var(--isx-text-placeholder)}
.isx-panel .isx-btn{margin-top:var(--s5)}

/* 大图查看层 */
.isx-viewer{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;background:var(--isx-paper);animation:isx-fade .16s linear}
@keyframes isx-fade{from{opacity:0}to{opacity:1}}
.isx-viewer-bar{display:flex;align-items:center;gap:var(--s2);height:48px;padding:0 var(--s3) 0 var(--s5);border-bottom:1px solid var(--isx-line-subtle);background:var(--isx-paper)}
.isx-viewer-title{margin-right:auto;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-viewer-body{flex:1;min-height:0;display:grid;place-items:center;padding:var(--s6);background:var(--isx-paper-2);overflow:auto}
.isx-viewer-body img{display:block;max-width:100%;max-height:calc(100vh - 150px);box-shadow:0 1px 0 var(--isx-line),0 24px 60px -28px rgba(0,0,0,.5);animation:isx-pop .26s var(--isx-ease)}
@keyframes isx-pop{from{opacity:0;transform:scale(.975)}to{opacity:1;transform:scale(1)}}
.isx-viewer-meta{display:flex;align-items:center;gap:var(--s4);flex-wrap:wrap;padding:var(--s3) var(--s5);border-top:1px solid var(--isx-line-subtle);font-family:var(--isx-mono);font-size:10.5px;letter-spacing:.04em;color:var(--isx-text-3)}

.isx-toast{position:fixed;left:50%;bottom:24px;z-index:70;transform:translateX(-50%);padding:9px 16px;background:var(--isx-ink);color:var(--isx-paper);font-size:13px;animation:isx-toast-in .22s var(--isx-ease)}
@keyframes isx-toast-in{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}

@media (max-width:1080px){
  .isx-rail{width:186px;padding-left:var(--s3);padding-right:var(--s3)}
  .isx-main{padding:var(--s7) var(--s6) var(--s10)}
}
@media (max-width:900px){
  .isx-root{overflow-y:auto}
  .isx-shell{display:block;height:auto}
  .isx-rail{flex-direction:row;flex-wrap:wrap;align-items:center;width:100%;height:auto;border-right:0;border-bottom:1px solid var(--isx-line-subtle);overflow:visible;padding:var(--s3) var(--s4)}
  .isx-brand{padding:0 var(--s4) 0 0}
  .isx-railgroup,.isx-railfoot,.isx-railthumbs{display:none}
  .isx-nav{width:auto;height:30px}
  .isx-main{overflow:visible}
  .isx-head h1{font-size:1.9rem}
  .isx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .isx-stat:nth-child(3){border-left:0}
  .isx-stat:nth-child(n+3){border-top:1px solid var(--isx-line-subtle)}
  .isx-two{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){
  .isx-root *,.isx-root *::before,.isx-root *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}
}


`

    const CSS_ID = 'dsh-imagine/panel.css'
    if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${CSS_ID}"]`) === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-imagine'
      tag.dataset.pluginCss = CSS_ID
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    // ── 图标 ──────────────────────────────────────────────────────────────
    function PanelIcon(props) {
      const size = (props && props.size) || 18
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: 3, y: 4.5, width: 18, height: 15, rx: 3 }),
        h('circle', { cx: 8.6, cy: 10, r: 1.7 }),
        h('path', { d: 'M4.5 17l4.2-4.4 3.4 3.3 2.6-2.3 4.8 4' }),
        h('path', { d: 'M18.4 2.6l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z', fill: 'currentColor', stroke: 'none' }),
      )
    }

    function SparkIcon() {
      return h(
        'svg',
        { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'currentColor' },
        h('path', { d: 'M12 2.6l1.9 5.2 5.2 1.9-5.2 1.9-1.9 5.2-1.9-5.2L4.9 9.7l5.2-1.9z' }),
      )
    }

    function ImagePlaceholderIcon() {
      return h(
        'svg',
        { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: 3, y: 4.5, width: 18, height: 15, rx: 3 }),
        h('circle', { cx: 8.6, cy: 10, r: 1.7 }),
        h('path', { d: 'M4.5 17l4.2-4.4 3.4 3.3 2.6-2.3 4.8 4' }),
      )
    }

    function TrashIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4 7h16M9.5 7V5.2A1.2 1.2 0 0110.7 4h2.6a1.2 1.2 0 011.2 1.2V7M6.5 7l.8 12.1A1.4 1.4 0 008.7 20.4h6.6a1.4 1.4 0 001.4-1.3L17.5 7' }),
      )
    }

    function FolderIcon() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M3.5 7.5A1.5 1.5 0 015 6h3.6l1.6 2H19a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0119 18H5a1.5 1.5 0 01-1.5-1.5z' }),
      )
    }

    // ── 面板 ──────────────────────────────────────────────────────────────
    function apply(ctx) {
      // 语言跟随 DSH；没有 locale 服务时按浏览器语言
      const langListeners = new Set()
      ctx.inject(['locale'], (c) => {
        const push = (snap) => {
          const next = snap && typeof snap.active === 'string' ? snap.active : null
          if (next && next !== currentLang) {
            currentLang = next
            langListeners.forEach((fn) => fn(currentLang))
          }
        }
        try {
          push(c.locale.getSnapshot())
        } catch {}
        c.on('locale/change', push)
      })

      // 跟随 DSH 主题：深色主题下把强调色换成同色系亮蓝
      let currentScheme = 'light'
      const schemeListeners = new Set()
      ctx.inject(['theme'], (c) => {
        const push = (snap) => {
          const next = snap && snap.active && typeof snap.active.colorScheme === 'string' ? snap.active.colorScheme : 'light'
          if (next === currentScheme) return
          currentScheme = next
          schemeListeners.forEach((fn) => fn(next))
        }
        try {
          push(c.theme.getTheme())
        } catch {}
        c.on('theme/change', push)
      })

      function Panel() {
        const [scheme, setScheme] = React.useState(currentScheme)
        React.useEffect(() => {
          schemeListeners.add(setScheme)
          setScheme(currentScheme)
          return () => {
            schemeListeners.delete(setScheme)
          }
        }, [])
        const [hostLang, setLang] = React.useState(currentLang)
        const [langPref, setLangPref] = React.useState('auto')
        const langChangedByUser = React.useRef(false)
        const lang = langPref === 'auto' ? hostLang : langPref
        currentLang = lang
        const [status, setStatus] = React.useState(null)
        const [statusError, setStatusError] = React.useState(null)
        const [loadingStatus, setLoadingStatus] = React.useState(true)
        const [refreshingQuota, setRefreshingQuota] = React.useState(false)
        const [prompt, setPrompt] = React.useState('')
        const [size, setSize] = React.useState('auto')
        const [background, setBackground] = React.useState('opaque')
        const [busy, setBusy] = React.useState(false)
        const [elapsed, setElapsed] = React.useState(0)
        const [result, setResult] = React.useState(null)
        const [error, setError] = React.useState(null)
        const [history, setHistory] = React.useState([])
        const [lightbox, setLightbox] = React.useState(null)
        const [showSettings, setShowSettings] = React.useState(false)
        const [proxyMode, setProxyMode] = React.useState('auto')
        const [proxyDraft, setProxyDraft] = React.useState('')
        const [codexPathDraft, setCodexPathDraft] = React.useState('')
        const [savingSettings, setSavingSettings] = React.useState(false)
        const [toast, setToast] = React.useState(null)
        const startRef = React.useRef(0)
        const toastTimer = React.useRef(null)
        const scrollRef = React.useRef(null)
        const [activeNav, setActiveNav] = React.useState('prompt')

        React.useEffect(() => {
          const el = scrollRef.current
          if (!el || typeof el.addEventListener !== 'function') return undefined
          const marks = ['prompt', 'work', 'account']
          function onScroll() {
            let current = 'prompt'
            const base = el.getBoundingClientRect().top
            marks.forEach((key) => {
              const node = el.querySelector(`#isx-sec-${key}`)
              if (!node || typeof node.getBoundingClientRect !== 'function') return
              const top = node.getBoundingClientRect().top - base + el.scrollTop
              if (top - 140 <= el.scrollTop) current = key
            })
            setActiveNav(current)
          }
          el.addEventListener('scroll', onScroll, { passive: true })
          onScroll()
          return () => el.removeEventListener('scroll', onScroll)
        }, [])

        function navButton(key, icon, label, extra) {
          return h(
            'button',
            { className: activeNav === key ? 'isx-nav is-on' : 'isx-nav', onClick: () => gotoSection(key) },
            icon,
            label,
            extra || null,
          )
        }

        function gotoSection(key) {
          setActiveNav(key)
          const el = scrollRef.current
          if (!el) return
          const node = el.querySelector(`#isx-sec-${key}`)
          if (!node) return
          const top = node.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 16
          const next = Math.max(0, Math.round(top))
          if (typeof el.scrollTo === 'function') el.scrollTo({ top: next, behavior: 'smooth' })
          else el.scrollTop = next
        }

        React.useEffect(() => {
          langListeners.add(setLang)
          return () => langListeners.delete(setLang)
        }, [])

        React.useEffect(() => {
          if (!busy) return undefined
          const timer = setInterval(() => {
            setElapsed(Math.round((Date.now() - startRef.current) / 1000))
          }, 500)
          return () => clearInterval(timer)
        }, [busy])

        function showToast(message) {
          setToast(message)
          if (toastTimer.current) clearTimeout(toastTimer.current)
          toastTimer.current = setTimeout(() => setToast(null), 2200)
        }

        function switchLang(next) {
          langChangedByUser.current = true
          setLangPref(next)
          currentLang = next
          langListeners.forEach((fn) => fn(next))
          apiPost('/api/settings', { lang: next }).catch(() => {})
        }

        async function loadStatus(quiet) {
          if (!quiet) setLoadingStatus(true)
          try {
            const body = await apiGet('/api/status')
            setStatus(body)
            setStatusError(null)
            const s = body.settings || {}
            if (!langChangedByUser.current && (s.lang === 'zh' || s.lang === 'en' || s.lang === 'auto')) {
              setLangPref(s.lang)
            }
            const storedProxy = typeof s.proxy === 'string' ? s.proxy.trim() : 'auto'
            if (!storedProxy || /^auto$/i.test(storedProxy)) {
              setProxyMode('auto')
              setProxyDraft('')
            } else if (/^(off|none|direct)$/i.test(storedProxy)) {
              setProxyMode('off')
              setProxyDraft('')
            } else {
              setProxyMode('custom')
              setProxyDraft(storedProxy)
            }
            setCodexPathDraft(s.codexPath || '')
            if (s.defaultSize) setSize(s.defaultSize)
            if (s.defaultBackground) setBackground(s.defaultBackground)
            if (body.provider) {
              // 目前只有 codex 一个引擎
            }
          } catch (err) {
            setStatusError(err)
          } finally {
            setLoadingStatus(false)
          }
        }

        async function loadHistory() {
          try {
            const body = await apiPost('/api/history', { limit: 60 })
            setHistory(body.images || [])
          } catch {
            // 历史读失败不拦界面
          }
        }

        React.useEffect(() => {
          loadStatus()
          loadHistory()
        }, [])

        async function refreshQuota() {
          setRefreshingQuota(true)
          try {
            const body = await apiPost('/api/quota', {})
            setStatus((prev) => (prev ? { ...prev, quota: body.quota, quotaError: null } : prev))
          } catch (err) {
            setStatus((prev) => (prev ? { ...prev, quotaError: { code: err.code, message: err.message } } : prev))
            showToast(err.message)
          } finally {
            setRefreshingQuota(false)
          }
        }

        async function generate() {
          const text = prompt.trim()
          if (!text) {
            setError(pluginError({ code: 'prompt-empty', message: t('promptRequired') }))
            return
          }
          setBusy(true)
          setError(null)
          setResult(null)
          startRef.current = Date.now()
          setElapsed(0)
          try {
            const body = await apiPost('/api/generate', { prompt: text, size, background })
            setResult(body.image)
            setHistory((prev) => [body.image, ...prev.filter((item) => item.id !== body.image.id)])
            if (status) {
              setStatus({ ...status, quota: null })
              refreshQuota()
            }
          } catch (err) {
            setError(err)
          } finally {
            setBusy(false)
          }
        }

        async function removeImage(id) {
          try {
            await apiPost('/api/remove', { id })
            setHistory((prev) => prev.filter((item) => item.id !== id))
            setResult((prev) => (prev && prev.id === id ? null : prev))
            if (lightbox && lightbox.id === id) setLightbox(null)
          } catch (err) {
            showToast(err.message)
          }
        }

        async function revealImage(id) {
          try {
            await apiPost('/api/reveal', { id })
          } catch (err) {
            showToast(err.message)
          }
        }

        async function saveSettings() {
          setSavingSettings(true)
          try {
            const proxyValue = proxyMode === 'custom' ? proxyDraft.trim() || 'auto' : proxyMode
            const body = await apiPost('/api/settings', { proxy: proxyValue, codexPath: codexPathDraft })
            setStatus((prev) => (prev ? { ...prev, settings: body.settings } : prev))
            showToast(t('saved'))
            setShowSettings(false)
            loadStatus(true)
            refreshQuota()
          } catch (err) {
            showToast(err.message)
          } finally {
            setSavingSettings(false)
          }
        }

        async function copyPrompt(text) {
          try {
            await navigator.clipboard.writeText(text)
            setPrompt(text)
            showToast(t('copied'))
          } catch {
            setPrompt(text)
            showToast(t('copyFailed'))
          }
        }

        React.useEffect(() => {
          if (!lightbox) return undefined
          const onKey = (event) => {
            if (event.key === 'Escape') setLightbox(null)
          }
          window.addEventListener('keydown', onKey)
          return () => window.removeEventListener('keydown', onKey)
        }, [lightbox])

        const account = (status && status.account) || null
        const ready = Boolean(account && account.ok)
        const quota = status && status.quota ? status.quota : null
        const quotaError = status && status.quotaError ? status.quotaError : null
        const primaryWindow = quota && Array.isArray(quota.windows) ? quota.windows[0] : null
        const usedPercent = primaryWindow && primaryWindow.usedPercent != null ? primaryWindow.usedPercent : null
        const quotaTone = usedPercent == null ? null : usedPercent >= 90 ? 'is-danger' : usedPercent >= 70 ? 'is-warn' : ''
        const resetAt = primaryWindow && primaryWindow.resetsAt ? new Date(primaryWindow.resetsAt).getTime() : null
        const planned = ((status && status.providers) || []).filter((item) => item.state !== 'ready')
        const examples = EXAMPLES.map((item) => item[lang] || item.zh)

        function eyebrow(text) {
          return h('div', { className: lang === 'zh' ? 'isx-eyebrow is-cjk' : 'isx-eyebrow' }, text)
        }

        function truncate(text, max) {
          const value = String(text || '')
          return value.length > max ? value.slice(0, max - 1) + '…' : value
        }

        function BrandIcon() {
          return h(
            'svg',
            { viewBox: '0 0 24 24' },
            h('rect', { x: '3', y: '5', width: '17', height: '14', rx: '3' }),
            h('circle', { cx: '8.6', cy: '10', r: '1.6' }),
            h('path', { d: 'M4.6 17.2l4.1-4.3 3.3 3.2 2.5-2.2 4.6 3.9' }),
            h('path', { d: 'M18.6 2.4l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z', fill: 'currentColor', stroke: 'none' }),
          )
        }

        function PromptIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('path', { d: 'M4 6h16M4 12h10M4 18h6' }))
        }

        function GalleryIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('rect', { x: '4', y: '5', width: '16', height: '14', rx: '1' }), h('path', { d: 'M4 15l4.5-4.5 3.5 3.5 3-3L20 15' }), h('circle', { cx: '9', cy: '9.5', r: '1.2' }))
        }

        function AccountIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('circle', { cx: '12', cy: '9', r: '3.4' }), h('path', { d: 'M5 19.5c1.4-3.4 4-5 7-5s5.6 1.6 7 5' }))
        }

        function CopyIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('path', { d: 'M9.5 9.5h8v8h-8z' }), h('path', { d: 'M6.5 15.5v-8h8' }))
        }

        function CloseIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('path', { d: 'M6 6l12 12M18 6L6 18' }))
        }

        function DownloadIcon() {
          return h('svg', { viewBox: '0 0 24 24' }, h('path', { d: 'M12 4v11m0 0l-4.2-4.2M12 15l4.2-4.2M5 19h14' }))
        }

        function downloadNode(item) {
          return h('a', { className: 'isx-ibtn', href: item.url, download: `${item.id}.png`, title: t('download') }, DownloadIcon())
        }

        function statCell(key, label, value, sub) {
          return h(
            'div',
            { className: 'isx-stat', key },
            h('div', { className: 'k' }, label),
            h('div', { className: 'val' }, value),
            sub ? h('div', { className: 'sub' }, sub) : null,
          )
        }

        function renderStats() {
          const plan = (quota && quota.plan) || (account && account.plan) || '—'
          const creditCount = quota && quota.resetCredits ? Number(quota.resetCredits.availableCount) || 0 : 0
          const usedText = usedPercent == null ? '—' : `${Math.round(usedPercent)}%`
          return h(
            'div',
            { className: 'isx-stats' },
            statCell('plan', t('plan'), plan, ready ? t('signedIn') : t('signedOut')),
            statCell('quota', t('quota'), usedText, primaryWindow ? windowLabel(primaryWindow.windowMinutes) : t('quotaUnavailable')),
            statCell(
              'resets',
              t('resetsShort'),
              resetAt ? formatClock(resetAt) : '—',
              resetAt ? t('quotaResets', { when: formatDelay(resetAt - Date.now()) }) : null,
            ),
            statCell(
              'credits',
              t('resetCreditsShort'),
              String(creditCount),
              creditCount > 0 ? t('resetCredits', { count: creditCount }) : t('quotaUnavailable'),
            ),
          )
        }

        function renderPromptSection() {
          const sizeKeys = { auto: 'sizeAuto', '1024x1536': 'sizePortrait', '1536x1024': 'sizeLandscape', '1024x1024': 'sizeSquare' }
          return h(
            'section',
            { className: 'isx-sec', id: 'isx-sec-prompt' },
            h(
              'div',
              { className: 'isx-sec-head' },
              h('span', { className: 'num' }, '01'),
              h('h2', null, t('prompt')),
            ),
            h(
              'div',
              { className: 'isx-promptbox' },
              h('textarea', {
                className: 'isx-prompt',
                value: prompt,
                placeholder: t('promptPlaceholder'),
                onChange: (event) => setPrompt(event.target.value),
                onKeyDown: (event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    generate()
                  }
                },
              }),
              h(
                'div',
                { className: 'isx-promptfoot' },
                h(
                  'select',
                  { className: 'isx-select', value: size, onChange: (event) => setSize(event.target.value), title: t('size') },
                  SIZE_OPTIONS.map((option) => h('option', { key: option, value: option }, t(sizeKeys[option] || 'sizeAuto'))),
                ),
                h(
                  'select',
                  { className: 'isx-select', value: background, onChange: (event) => setBackground(event.target.value), title: t('background') },
                  h('option', { value: 'opaque' }, t('bgOpaque')),
                  h('option', { value: 'transparent' }, t('bgTransparent')),
                ),
                h('span', { className: 'isx-grow' }),
                h('span', { className: 'isx-hint' }, busy ? `${elapsed}s` : t('sizeHint')),
                h(
                  'button',
                  { className: 'isx-btn is-lg is-accent', onClick: () => generate(), disabled: busy || !ready },
                  busy ? t('generating') : t('generate'),
                ),
              ),
            ),
            h(
              'div',
              { className: 'isx-examples' },
              h('span', { className: 'isx-hint', key: 'label' }, t('examples')),
              examples.map((text, index) =>
                h(
                  'button',
                  { className: 'isx-example', key: index, title: text, onClick: () => setPrompt(text) },
                  truncate(text, lang === 'zh' ? 24 : 44),
                ),
              ),
            ),
            error
              ? h(
                  'div',
                  { className: 'isx-alert' },
                  h('strong', null, t('error')),
                  error.message || String(error),
                  errorHint(error.code) ? h('div', { style: { marginTop: '4px' } }, errorHint(error.code)) : null,
                  h('div', null, h('button', { className: 'isx-btn is-ghost', onClick: () => generate() }, t('retry'))),
                )
              : null,
          )
        }

        function tiltOn(event) {
          const el = event.currentTarget
          const rect = el.getBoundingClientRect()
          if (!rect.width || !rect.height) return
          el.style.setProperty('--tx', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
          el.style.setProperty('--ty', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
        }

        function tiltOff(event) {
          const el = event.currentTarget
          el.style.removeProperty('--tx')
          el.style.removeProperty('--ty')
        }

        function workCard(item, isNew, index) {
          const sizeText = item.width && item.height ? `${item.width} × ${item.height}` : item.size || '—'
          const timeText = item.elapsedMs ? t('seconds', { seconds: Math.round(item.elapsedMs / 1000) }) : formatClock(item.createdAt)
          return h(
            'article',
            {
              className: isNew ? 'isx-work is-new' : 'isx-work',
              key: isNew ? `new-${item.id}` : item.id,
              style: { '--d': `${Math.min(index || 0, 12) * 40}ms` },
              onMouseMove: tiltOn,
              onMouseLeave: tiltOff,
            },
            h(
              'div',
              { className: 'isx-thumb' },
              h('img', { src: item.url, alt: item.prompt || '', loading: 'lazy', onClick: () => setLightbox(item) }),
              h(
                'div',
                { className: 'isx-thumbacts' },
                h('button', { className: 'isx-ibtn', title: t('reveal'), onClick: () => revealImage(item.id) }, FolderIcon()),
                downloadNode(item),
                h('button', { className: 'isx-ibtn', title: t('delete'), onClick: () => removeImage(item.id) }, TrashIcon()),
              ),
            ),
            h(
              'div',
              { className: 'isx-work-body' },
              h(
                'div',
                { className: 'isx-work-kicker' },
                h('span', { className: 'isx-dot' }),
                h('span', { className: 'txt' }, isNew ? t('latest') : item.provider || 'ChatGPT'),
                h('span', null, '·'),
                h('span', null, item.quality || '—'),
              ),
              h('div', { className: 'isx-work-title' }, item.prompt || '—'),
            ),
            h(
              'div',
              { className: 'isx-work-foot' },
              h('span', null, sizeText),
              h('span', { className: 'isx-grow' }, formatBytes(item.bytes)),
              h('span', null, timeText),
            ),
          )
        }

        function renderWorkSection() {
          const cards = []
          if (busy) {
            cards.push(
              h(
                'div',
                { className: 'isx-generating', key: 'generating' },
                h('div', { className: 'isx-hint' }, t('generating')),
                h('div', { className: 'isx-genbar' }, h('i')),
                h('div', { className: 'isx-note' }, `${t('generatingHint')}${elapsed ? ` · ${elapsed}s` : ''}`),
              ),
            )
          } else if (result) {
            cards.push(workCard(result, true, 0))
          }
          history.forEach((item) => {
            if (result && item.id === result.id) return
            cards.push(workCard(item, false, cards.length))
          })
          if (!cards.length) cards.push(h('div', { className: 'isx-empty', key: 'empty' }, t('historyEmpty')))
          return h(
            'section',
            { className: 'isx-sec', id: 'isx-sec-work' },
            h(
              'div',
              { className: 'isx-sec-head' },
              h('span', { className: 'num' }, '02'),
              h('h2', null, t('history')),
              h('span', { className: 'more' }, t('workCount', { count: history.length })),
            ),
            h('div', { className: 'isx-grid' }, cards),
          )
        }

        function renderAccountPanel() {
          if (!ready) {
            return h(
              'div',
              { className: 'isx-panel' },
              h('div', { className: 'k' }, t('account')),
              h(
                'div',
                { className: 'isx-alert' },
                h('strong', null, t('firstRunTitle')),
                t('firstRunBody'),
                h('div', null, h('button', { className: 'isx-btn is-ghost', onClick: () => loadStatus() }, t('firstRunCheck'))),
              ),
            )
          }
          const initial = (account.email || 'C').slice(0, 1).toUpperCase()
          const percent = Math.max(0, Math.min(100, Number(usedPercent) || 0))
          const creditCount = quota && quota.resetCredits ? Number(quota.resetCredits.availableCount) || 0 : 0
          return h(
            'div',
            { className: 'isx-panel' },
            h('div', { className: 'k' }, t('account')),
            h(
              'div',
              { className: 'isx-account' },
              h('div', { className: 'isx-avatar' }, initial),
              h(
                'div',
                { style: { minWidth: 0 } },
                h('div', { className: 'isx-email' }, account.email || t('signedIn')),
                h('div', { className: 'isx-plan' }, (quota && quota.plan) || account.plan || '—'),
              ),
            ),
            primaryWindow
              ? h(
                  'div',
                  null,
                  h(
                    'div',
                    { className: 'isx-quota-row' },
                    h('span', { className: 'isx-mono' }, windowLabel(primaryWindow.windowMinutes)),
                    h('span', { className: 'v' }, `${Math.round(percent)}%`),
                  ),
                  h('div', { className: 'isx-bar' }, h('i', { style: { width: `${percent}%` } })),
                  resetAt
                    ? h(
                        'div',
                        { className: 'isx-note', style: { marginTop: '8px' } },
                        t('quotaResetAt', { time: formatClock(resetAt) }),
                        lang === 'zh' ? '· ' : ' · ',
                        t('quotaResets', { when: formatDelay(resetAt - Date.now()) }),
                      )
                    : null,
                )
              : h('div', { className: 'isx-note' }, t('quotaUnavailable')),
            creditCount > 0 ? h('div', { className: 'isx-note', style: { marginTop: '8px' } }, t('resetCredits', { count: creditCount })) : null,
            h(
              'button',
              { className: 'isx-btn is-ghost', onClick: () => refreshQuota(), disabled: refreshingQuota },
              refreshingQuota ? t('refreshing') : t('refreshQuota'),
            ),
          )
        }

        function renderSettingsPanel() {
          const providers = (status && status.providers) || []
          return h(
            'div',
            { className: 'isx-panel' },
            h('div', { className: 'k' }, t('settings')),
            h(
              'div',
              { className: 'isx-pills' },
              providers.map((item) =>
                h(
                  'span',
                  {
                    className: item.state === 'ready' ? 'isx-pill is-on' : 'isx-pill is-planned',
                    key: item.id,
                    title: item.note ? item.note[lang] || item.note.zh : '',
                  },
                  item.title ? item.title[lang] || item.title.zh : item.id,
                ),
              ),
            ),
            h('div', { className: 'isx-note', style: { marginTop: '8px' } }, t('providerNote')),
            h(
              'div',
              { className: 'isx-field' },
              h('label', null, t('proxy')),
              h(
                'select',
                { className: 'isx-select', value: proxyMode, onChange: (event) => setProxyMode(event.target.value) },
                h('option', { value: 'auto' }, t('proxyAuto')),
                h('option', { value: 'off' }, t('proxyOff')),
                h('option', { value: 'custom' }, t('proxyCustom')),
              ),
              proxyMode === 'custom'
                ? h('input', {
                    className: 'isx-input',
                    style: { marginTop: '6px' },
                    value: proxyDraft,
                    placeholder: '127.0.0.1:7890',
                    onChange: (event) => setProxyDraft(event.target.value),
                  })
                : null,
              h('div', { className: 'isx-note', style: { marginTop: '6px' } }, t('proxyHint')),
            ),
            h(
              'div',
              { className: 'isx-field' },
              h('label', null, t('codexPath')),
              h('input', {
                className: 'isx-input',
                value: codexPathDraft,
                placeholder: '/usr/local/bin/codex',
                onChange: (event) => setCodexPathDraft(event.target.value),
              }),
            ),
            h('button', { className: 'isx-btn', onClick: () => saveSettings(), disabled: savingSettings }, savingSettings ? t('saving') : t('save')),
            h('div', { className: 'isx-path' }, `${t('paths')}: ${(status && status.dataDir) || '—'}`),
          )
        }

        const viewer = lightbox
          ? h(
              'div',
              { className: 'isx-viewer', role: 'dialog', 'aria-modal': 'true' },
              h(
                'div',
                { className: 'isx-viewer-bar' },
                h('span', { className: 'isx-viewer-title' }, lightbox.prompt || t('result')),
                h('button', { className: 'isx-ibtn', title: t('copyPrompt'), onClick: () => copyPrompt(lightbox.prompt) }, CopyIcon()),
                downloadNode(lightbox),
                h('button', { className: 'isx-ibtn', title: t('reveal'), onClick: () => revealImage(lightbox.id) }, FolderIcon()),
                h('button', { className: 'isx-ibtn', title: t('close'), onClick: () => setLightbox(null) }, CloseIcon()),
              ),
              h('div', { className: 'isx-viewer-body' }, h('img', { src: lightbox.url, alt: lightbox.prompt || '' })),
              h(
                'div',
                { className: 'isx-viewer-meta' },
                h('span', null, lightbox.width && lightbox.height ? `${lightbox.width} × ${lightbox.height}` : lightbox.size || '—'),
                h('span', null, formatBytes(lightbox.bytes)),
                h(
                  'span',
                  null,
                  lightbox.elapsedMs ? t('seconds', { seconds: Math.round(lightbox.elapsedMs / 1000) }) : formatClock(lightbox.createdAt),
                ),
                lightbox.quality ? h('span', null, lightbox.quality) : null,
              ),
            )
          : null

        return h(
          'div',
          { className: 'isx-root', 'data-scheme': scheme },
          h(
            'div',
            { className: 'isx-shell' },
            h(
              'aside',
              { className: 'isx-rail' },
              h(
                'div',
                { className: 'isx-brand' },
                h('div', { className: 'isx-brandmark' }, h('img', { src: `${API}/icon.png`, alt: '', loading: 'lazy' })),
                h(
                  'div',
                  { className: 'isx-brandtext' },
                  h('div', { className: 'isx-brandname' }, t('title')),
                  h('div', { className: 'isx-brandpkg' }, 'dsh-imagine'),
                ),
              ),
              h('div', { className: 'isx-railgroup' }, t('railCreate')),
              navButton('prompt', PromptIcon(), t('navGenerate')),
              navButton('work', GalleryIcon(), t('navHistory'), h('span', { className: 'count' }, String(history.length))),
              history.length
                ? h('div', { className: 'isx-railgroup' }, t('railRecent'))
                : null,
              history.length
                ? h(
                    'div',
                    { className: 'isx-railthumbs' },
                    history.slice(0, 3).map((item) =>
                      h('button', {
                        key: item.id,
                        className: 'isx-railthumb',
                        style: { backgroundImage: `url(${item.url})` },
                        title: truncate(item.prompt || '', 40),
                        onClick: () => setLightbox(item),
                      }),
                    ),
                  )
                : null,
              h('div', { className: 'isx-railgroup' }, t('railAccount')),
              navButton('account', AccountIcon(), t('navAccount')),
              h(
                'div',
                { className: 'isx-railfoot' },
                h('b', null, `IMAGE STUDIO ${(status && status.version) || '0.1.0'}`),
                h('div', null, `${t('provider')} · ${(status && status.provider) || 'codex'}`),
                h('div', null, (status && status.dataDir) || '—'),
              ),
            ),
            h(
              'div',
              { className: 'isx-main', ref: scrollRef },
              h(
                'div',
                { className: 'isx-inner' },
                h(
                  'header',
                  { className: 'isx-head' },
              h(
                'div',
                { className: 'isx-headrow' },
                h('div', null, eyebrow((status && status.provider) || 'Codex'), h('h1', null, t('title')), h('p', null, t('subtitle'))),
                h(
                  'div',
                  { className: 'isx-headtools' },
                  h(
                    'div',
                    { className: 'isx-lang', role: 'group', title: t('language'), 'aria-label': t('language') },
                    h(
                      'button',
                      { className: lang === 'zh' ? 'isx-langopt is-on' : 'isx-langopt', onClick: () => switchLang('zh'), 'aria-pressed': lang === 'zh' },
                      '中文',
                    ),
                    h(
                      'button',
                      { className: lang === 'en' ? 'isx-langopt is-on' : 'isx-langopt', onClick: () => switchLang('en'), 'aria-pressed': lang === 'en' },
                      'EN',
                    ),
                  ),
                  h('button', { className: 'isx-btn is-ghost', onClick: () => { loadStatus(true); loadHistory() } }, t('refresh')),
                ),
              ),
            ),
            statusError
              ? h(
                  'div',
                  { className: 'isx-alert' },
                  h('strong', null, t('error')),
                  statusError.message || String(statusError),
                  h('div', null, h('button', { className: 'isx-btn is-ghost', onClick: () => loadStatus() }, t('retry'))),
                )
              : null,
            renderStats(),
            renderPromptSection(),
            renderWorkSection(),
            h(
              'section',
              { className: 'isx-sec', id: 'isx-sec-account' },
              h(
                'div',
                { className: 'isx-sec-head' },
                h('span', { className: 'num' }, '03'),
                h('h2', null, t('accountSettings')),
              ),
              h('div', { className: 'isx-two' }, renderAccountPanel(), renderSettingsPanel()),
            ),
              ),
            ),
          ),
          toast ? h('div', { className: 'isx-toast' }, toast) : null,
          viewer,
        )
      }

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: PANEL, order: 9, label: () => t('title') },
          PanelIcon,
        ),
      )
      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, Panel))
    }

    exports.isPlugin = true
    exports.inject = ['slots']
    exports.apply = apply
    return module.exports
  },
})
