// 十六跟做图 · 浏览器半边：侧栏入口 + 主区域面板。
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
        title: '十六跟做图',
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
        title: 'Template Studio',
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

    // 画幅比例 → 实际提交给模型的像素。比例本身是「建议」，写进提示词里由模型按画面微调。
    const RATIOS = [
      { key: 'auto', size: 'auto' },
      { key: '3:4', size: '1024x1536' },
      { key: '2:3', size: '1024x1536' },
      { key: '9:16', size: '1024x1536' },
      { key: '1:1', size: '1024x1024' },
      { key: '4:3', size: '1536x1024' },
      { key: '3:2', size: '1536x1024' },
      { key: '16:9', size: '1536x1024' },
      { key: '21:9', size: '1536x1024' },
      { key: '4:5', size: '1024x1536' },
    ]

    const HANDRAW_REPO = 'https://github.com/yang0/handraw-style'

    function sizeForRatio(ratio) {
      const found = RATIOS.find((item) => item.key === ratio)
      return found ? found.size : 'auto'
    }

    function ratioLabel(ratio) {
      const found = RATIOS.find((item) => item.key === ratio)
      if (!found) return ratio
      if (found.size === 'auto') return lt('ratioAuto')
      return `${found.key} · ${found.size.replace('x', '×')}`
    }

    /** 素材封面：精选场景随包分发（cover/local），其余按需拉取（cover/remote）。 */
    function coverSrc(cover) {
      if (!cover) return ''
      if (cover.local) return `${API}/templates/cover/${cover.local}`
      if (cover.remote) return `${API}/templates/asset?path=${encodeURIComponent(cover.remote)}`
      return ''
    }

    /** 导出的 Markdown：front matter 固定带来源与许可，正文只有提示词，末尾是署名注释。 */
    function buildMarkdown({ title, id, template, params, prompt, version }) {
      const stamp = new Date().toISOString()
      const head = [
        '---',
        `source: ${HANDRAW_REPO}`,
        `version: ${version || 'unknown'}`,
        'license: MIT (with attribution requirement)',
        'author: yang0',
        `title: ${title || ''}`,
        `template: ${id || ''}${template && template !== id ? ` / ${template}` : ''}`,
        `params: ${params || ''}`,
        `exported: ${stamp}`,
        '---',
        '',
      ].join('\n')
      const foot = [
        '',
        '',
        `<!-- 提示词来自 handraw-style（${HANDRAW_REPO}），作者 yang0，MIT 许可（要求保留署名）。本文件由「十六跟做图」导出。 -->`,
        '',
      ].join('\n')
      return head + (prompt || '') + foot
    }

    function saveTextFile(name, text) {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 4000)
    }

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

    // ── 模板库文案 ────────────────────────────────────────────────────────
    const LIB = {
      zh: {
        navLibrary: '模板库',
        libTitle: '模板库',
        libLead:
          '594 条上游素材 + 60 个精选场景。挑一个成品配方，写一句主题，剩下 5 个参数已经配好——拼装器按素材原文把你的主题和这些参数拼成一段可直接出图的提示词。',
        eyebrow: 'HANDRAW STYLE',
        tabScenes: '精选场景',
        tabLayout: '排版图型',
        tabStyle: '画风',
        tabColor: '主题色 · 影调',
        chipAll: '全部',
        searchPlaceholder: '搜索编号、名称或关键词，如 SC-014 / 信息图 / 留白',
        sortHint: '按编号排序',
        follow: '跟做',
        openPreview: '看大图',
        viewPrompt: '看提示词',
        charsUnit: '字',
        chars: '正文字数',
        kind: '类型',
        category: '分类',
        code: '编号',
        domains: {
          knowledge: '知识科普',
          work: '职场 · 商业',
          life: '生活方式 · 情绪',
          commerce: '产品 · 电商',
          ip: 'IP · 品牌',
          story: '漫画 · 叙事',
        },
        suggest: '建议',
        credit: '素材与提示词来自 yang0 的 handraw-style（MIT，保留署名）',
        cacheLabel: '图片已缓存 {cached}/{total}',
        cacheRefresh: '刷新缓存',
        loading: '正在载入模板库…',
        loadFailed: '模板库载入失败',
        retry: '重试',
        empty: '没有匹配的模板',
        totalItems: '{count} 项',
        scenesHint: '锁定版式 / 画风 / 主题色 / 影调 / 比例，填一句主题就能出图',
        assetsHint: '上游原始素材，可以单独套用在任何一次生成上',
        applied: '已套用模板',
        appliedHint: '模板已套用 · 可直接改文字',
        recompose: '重新拼装',
        exportMd: '导出 .md',
        clear: '清除',
        stripLabel: '模板参考',
        stripHint: '点任意缩略图套用它的画风 / 版式 / 配色',
        stripAll: '全部 {count} →',
        previewTitle: '模板预览',
        prevOne: '上一张',
        nextOne: '下一张',
        copy: '复制',
        copied: '已复制',
        followThis: '跟做这一张',
        followTitle: '一键跟做',
        params: '结构参数',
        paramsHint: '来自模板，可逐个换',
        theme: '你的主题',
        themeRequired: '必填',
        themePlaceholder: '一句话说清你要画什么，例如：为什么搬家以后，我反而更常做早餐了',
        brief: '画面要求',
        briefOptional: '可选',
        briefPlaceholder: '例如：不要真人出镜，用手绘小人代替；标题控制在 12 字以内',
        promptPreview: '提示词预览',
        promptChars: '{count} 字',
        fillToStudio: '填充到创作页',
        fillHint: '填充后仍可自由改文字，不会锁定',
        cancel: '取消',
        close: '关闭',
        needTheme: '先写一句主题再填充',
        composeFailed: '拼装失败',
        exampleNote:
          '官方示例图 · 只看版式与留白关系；示例画面内容不会写进提示词（库的硬规则：画风特征只写媒介、光影、色彩这类纯视觉语言）。',
        kindLayout: '排版图型',
        kindStyle: '画风',
        kindColor: '主题色',
        kindTone: '影调',
        domain: '场景域',
        mode: '模式',
        modeGraphic: '图文一体',
        modePure: '纯图',
        ratio: '画幅',
        sourceVersion: '可用仓库 v{version}',
        exported: '已导出 Markdown',
        exportName: 'handraw-{id}-{name}.md',
      },
      en: {
        navLibrary: 'Templates',
        libTitle: 'Templates',
        libLead:
          '594 upstream assets plus 60 ready-made recipes. Pick a recipe, write one line of theme, and the remaining five parameters are already set — the composer stitches your theme onto the original asset text.',
        eyebrow: 'HANDRAW STYLE',
        tabScenes: 'Recipes',
        tabLayout: 'Layouts',
        tabStyle: 'Styles',
        tabColor: 'Colors · Tones',
        chipAll: 'All',
        searchPlaceholder: 'Search id, name or keyword, e.g. SC-014 / infographic / whitespace',
        sortHint: 'sorted by id',
        follow: 'Use',
        openPreview: 'Preview',
        viewPrompt: 'Prompt',
        charsUnit: 'chars',
        chars: 'Characters',
        kind: 'Kind',
        category: 'Category',
        code: 'ID',
        domains: {
          knowledge: 'Knowledge',
          work: 'Work & business',
          life: 'Life & mood',
          commerce: 'Product & commerce',
          ip: 'IP & brand',
          story: 'Comic & story',
        },
        suggest: 'suggested',
        credit: 'Assets and prompts by yang0 · handraw-style (MIT, attribution required)',
        cacheLabel: 'Images cached {cached}/{total}',
        cacheRefresh: 'Refresh cache',
        loading: 'Loading templates…',
        loadFailed: 'Failed to load templates',
        retry: 'Retry',
        empty: 'No template matches',
        totalItems: '{count} items',
        scenesHint: 'Layout, style, color, tone and ratio are locked — just add a theme',
        assetsHint: 'Raw upstream assets, usable on any generation',
        applied: 'Template applied',
        appliedHint: 'Template applied · edit the text freely',
        recompose: 'Recompose',
        exportMd: 'Export .md',
        clear: 'Clear',
        stripLabel: 'Template references',
        stripHint: 'Click a thumbnail to borrow its style / layout / palette',
        stripAll: 'All {count} →',
        previewTitle: 'Template preview',
        prevOne: 'Previous',
        nextOne: 'Next',
        copy: 'Copy',
        copied: 'Copied',
        followThis: 'Use this one',
        followTitle: 'Use template',
        params: 'Parameters',
        paramsHint: 'from the template, each editable',
        theme: 'Your theme',
        themeRequired: 'required',
        themePlaceholder: 'One line about what you want, e.g. why I cook breakfast more often after moving',
        brief: 'Art direction',
        briefOptional: 'optional',
        briefPlaceholder: 'e.g. no real people, replace with drawn figures; keep the title under 12 characters',
        promptPreview: 'Prompt preview',
        promptChars: '{count} chars',
        fillToStudio: 'Fill into studio',
        fillHint: 'You can edit everything afterwards; nothing is locked',
        cancel: 'Cancel',
        close: 'Close',
        needTheme: 'Write a theme first',
        composeFailed: 'Compose failed',
        exampleNote:
          'Official sample — read the layout and negative space only. Sample subject matter never enters the prompt: style traits describe medium, light and color, nothing else.',
        kindLayout: 'Layout',
        kindStyle: 'Style',
        kindColor: 'Color',
        kindTone: 'Tone',
        domain: 'Domain',
        mode: 'Mode',
        modeGraphic: 'Image + text',
        modePure: 'Image only',
        ratio: 'Ratio',
        sourceVersion: 'repository v{version}',
        exported: 'Markdown exported',
        exportName: 'handraw-{id}-{name}.md',
      },
    }


    // P1/P2 新增文案（与 LIB 分开，便于按功能块维护）
    const LIB_EXTRA = {
      zh: {
        filterMode: '模式',
        filterRatio: '比例',
        filterAll: '全部',
        filterSource: '来源',
        sourceAll: '全部',
        sourceFav: '收藏 {n}',
        sourceRecent: '最近使用 {n}',
        favOn: '已收藏',
        favOff: '收藏',
        syncAssets: '同步素材',
        syncFull: '全量重下',
        syncStarted: '已开始后台同步素材，进度会自己刷新',
        syncFailed: '同步失败：{message}',
        syncRunning: '同步中 {done}/{total}（{percent}%）',
        syncDone: '素材已全部缓存（{total} 张）',
        syncIdle: '素材按需缓存 {cached}/{total}',
        cacheTitle: '素材缓存',
        cacheLine: '已缓存 {cached}/{total} 张 · {size}',
        cacheClear: '清理缓存',
        cacheCleared: '已清理素材缓存',
        cacheLimit: '缓存上限（MB，0 = 不限）',
        localDir: 'handraw-style 本地目录（可选）',
        localDirHint: '填本地克隆的仓库根目录，图片直接从本地读，不再联网；留空则用 CDN + 本地缓存。',
        localDirOk: '本地图片可用',
        nothingToExport: '没有可导出的内容',
        exportedToDisk: '已导出 {count} 条到 {path}',
        exportFailed: '导出失败：{message}',
        exportFiltered: '导出当前筛选',
        exportAll: '导出整个精选集',
        pickerTitle: '自由组合素材',
        pickerHint: '自己挑画风、图型、主题色与影调；下面实时显示拼装结果。',
        pickerOpen: '自由组合',
        pickerSlotLayout: '排版图型',
        pickerSlotStyle: '画风',
        pickerSlotColor: '主题色',
        pickerSlotTone: '影调',
        pickerSlotCharacter: '角色画风（融合）',
        pickerSlotScene: '场景画风（融合）',
        pickerNone: '不选',
        pickerPick: '选择',
        pickerBack: '返回',
        assist: 'AI 帮我配',
        assistBusy: 'AI 思考中…',
        assistDone: 'AI 已推荐参数，可继续手动改',
        assistFailed: 'AI 推荐失败',
        pickerApply: '填充到创作页',
        pickerAssist: 'AI 帮我配',
        pickerAssistBusy: 'AI 正在挑参数…',
        pickerAssistNote: 'AI 建议：{reason}',
        pickerNeedStyle: '至少要选一个画风',
        referenceTitle: '参考图（垫图）',
        referenceHint: '上传一张照片，让模型按所选画风重画它的构图与人物（需要账号支持 images/edits）。',
        referencePick: '选择图片',
        referenceClear: '去掉参考图',
        referenceTooBig: '参考图太大了（上限 12MB）',
        referenceBad: '只支持 PNG / JPEG / WebP',
        referenceReady: '已附加参考图 · {size}',
        capabilityOk: '出图接口可用',
        capabilityForbidden: '账号被后端拒绝出图（HTTP 403）',
        capabilityUnknown: '出图能力未知（还没试过）',
        capabilityTitle: '出图能力',
      },
      en: {
        filterMode: 'Mode',
        filterRatio: 'Ratio',
        filterAll: 'All',
        filterSource: 'Source',
        sourceAll: 'All',
        sourceFav: 'Favorites {n}',
        sourceRecent: 'Recent {n}',
        favOn: 'Favorited',
        favOff: 'Favorite',
        syncAssets: 'Sync assets',
        syncFull: 'Re-download all',
        syncStarted: 'Background asset sync started',
        syncFailed: 'Sync failed: {message}',
        syncRunning: 'Syncing {done}/{total} ({percent}%)',
        syncDone: 'All assets cached ({total})',
        syncIdle: 'Cached on demand {cached}/{total}',
        cacheTitle: 'Asset cache',
        cacheLine: '{cached}/{total} cached · {size}',
        cacheClear: 'Clear cache',
        cacheCleared: 'Asset cache cleared',
        cacheLimit: 'Cache limit (MB, 0 = unlimited)',
        localDir: 'Local handraw-style checkout (optional)',
        localDirHint: 'Point at your local clone and images load from disk instead of the CDN.',
        localDirOk: 'Local images available',
        nothingToExport: 'Nothing to export',
        exportedToDisk: 'Exported {count} items to {path}',
        exportFailed: 'Export failed: {message}',
        exportFiltered: 'Export filtered',
        exportAll: 'Export all recipes',
        pickerTitle: 'Compose from assets',
        pickerHint: 'Pick a layout, style, palette and tone; the prompt updates live.',
        pickerOpen: 'Compose',
        pickerSlotLayout: 'Layout',
        pickerSlotStyle: 'Style',
        pickerSlotColor: 'Palette',
        pickerSlotTone: 'Tone',
        pickerSlotCharacter: 'Character style (fusion)',
        pickerSlotScene: 'Scene style (fusion)',
        pickerNone: 'None',
        pickerPick: 'Pick',
        pickerBack: 'Back',
        assist: 'AI picks',
        assistBusy: 'AI thinking…',
        assistDone: 'AI suggested parameters — tweak freely',
        assistFailed: 'AI suggestion failed',
        pickerApply: 'Fill into studio',
        pickerAssist: 'Ask AI',
        pickerAssistBusy: 'AI is picking…',
        pickerAssistNote: 'AI suggests: {reason}',
        pickerNeedStyle: 'Pick at least one style',
        referenceTitle: 'Reference image',
        referenceHint: 'Attach a photo and let the model repaint it in the chosen style (needs images/edits support).',
        referencePick: 'Choose image',
        referenceClear: 'Remove',
        referenceTooBig: 'Reference image is too large (max 12MB)',
        referenceBad: 'Only PNG / JPEG / WebP',
        referenceReady: 'Reference attached · {size}',
        capabilityOk: 'Image endpoint available',
        capabilityForbidden: 'Backend rejects image generation (HTTP 403)',
        capabilityUnknown: 'Image capability unknown (not tried yet)',
        capabilityTitle: 'Image capability',
      },
    }

    function lt(key, vars) {
      const dict = LIB[currentLang] || LIB.zh
      const more = LIB_EXTRA[currentLang] || LIB_EXTRA.zh
      let value = dict[key] || (LIB.zh[key] || more[key] || LIB_EXTRA.zh[key] || key)
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

/* ── 模板库 ───────────────────────────────────────────────────────────── */
.isx-libbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2);margin:var(--s5) 0 0;border-bottom:1px solid var(--isx-line);padding-bottom:0}
.isx-tabs{display:flex;gap:var(--s5);flex:1;min-width:0}
.isx-tab{position:relative;background:none;border:0;padding:0 0 11px;color:var(--isx-text-3);font-family:inherit;font-size:13.5px;cursor:pointer;letter-spacing:.01em;transition:color .2s var(--isx-ease)}
.isx-tab .n{margin-left:6px;font-family:var(--isx-mono);font-size:10.5px;color:var(--isx-text-3);opacity:.9}
.isx-tab:hover{color:var(--isx-ink)}
.isx-tab.is-on{color:var(--isx-ink)}
.isx-tab.is-on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:linear-gradient(90deg,var(--isx-accent),var(--isx-c3))}
.isx-libmetabar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px var(--s3);padding:12px 0;border-bottom:1px solid var(--isx-line-subtle)}
.isx-chips{display:flex;gap:6px;flex-wrap:wrap;min-width:0;grid-column:1/-1}
.isx-searching{flex:0 0 auto}
.isx-chip{background:none;border:1px solid var(--isx-line);color:var(--isx-text-3);padding:4px 10px;font-family:inherit;font-size:11.5px;cursor:pointer;transition:all .18s var(--isx-ease)}
.isx-chip .n{margin-left:5px;font-family:var(--isx-mono);font-size:10px;opacity:.8}
.isx-chip:hover{border-color:var(--isx-line-strong);color:var(--isx-ink)}
.isx-chip.is-on{background:var(--isx-ink);border-color:var(--isx-ink);color:var(--isx-paper)}
.isx-searching{display:flex;align-items:center;gap:8px;border:1px solid var(--isx-line);padding:7px 10px;min-width:min(360px,100%);transition:border-color .18s var(--isx-ease)}
.isx-searching:focus-within{border-color:var(--isx-line-strong)}
.isx-searching svg{width:13px;height:13px;flex:none;color:var(--isx-text-3);fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
.isx-searching input{border:0;background:none;outline:none;color:var(--isx-ink);font-family:inherit;font-size:12.5px;width:100%}
.isx-searching input::placeholder{color:var(--isx-text-placeholder)}
.isx-libcount{font-family:var(--isx-mono);font-size:10.5px;color:var(--isx-text-3);letter-spacing:.04em;white-space:nowrap}
.isx-tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:var(--s4);margin-top:var(--s5)}
.isx-tpl{display:flex;flex-direction:column;border:1px solid var(--isx-line-subtle);background:var(--isx-paper);transition:border-color .2s var(--isx-ease),transform .25s var(--isx-ease);animation:isx-rise .42s var(--isx-ease) both}
.isx-tpl:hover{border-color:var(--isx-line-strong);transform:translateY(-2px)}
.isx-tplimg{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--isx-paper-2);cursor:zoom-in}
.isx-tplimg img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s var(--isx-ease)}
.isx-tpl:hover .isx-tplimg img{transform:scale(1.035)}
.isx-tplimg .tag{position:absolute;left:0;top:0;background:rgba(10,12,16,.82);color:#fff;font-family:var(--isx-mono);font-size:9.5px;letter-spacing:.06em;padding:3px 7px}
.isx-tplimg .alpha{position:absolute;left:8px;bottom:8px;right:8px;font-family:var(--isx-mono);font-size:9.5px;color:#fff;opacity:0;transition:opacity .2s var(--isx-ease)}
.isx-tpl:hover .isx-tplimg .alpha{opacity:.8}
.isx-tplbody{padding:11px 12px 0;display:flex;flex-direction:column;gap:3px;flex:1}
.isx-tplid{font-family:var(--isx-mono);font-size:10px;letter-spacing:.05em;color:var(--isx-text-3)}
.isx-tplname{font-size:13.5px;font-weight:400;color:var(--isx-ink);line-height:1.45;margin:0}
.isx-tplmeta{font-family:var(--isx-mono);font-size:9.5px;color:var(--isx-text-3);letter-spacing:.03em;margin-top:2px}
.isx-tplacts{display:flex;gap:8px;padding:10px 12px 12px}
.isx-tplacts .isx-btn{flex:1;height:28px;padding:0;font-size:12px}
.isx-fav{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(8,10,14,.5);color:#fff;font-size:12px;line-height:1;display:grid;place-items:center;cursor:pointer;opacity:0;transition:opacity .18s var(--isx-ease),transform .18s var(--isx-ease);backdrop-filter:blur(6px)}
.isx-tpl:hover .isx-fav,.isx-fav.is-on{opacity:1}
.isx-fav.is-on{color:#ffd166;border-color:rgba(255,209,102,.55)}
.isx-fav:hover{transform:scale(1.08)}
.isx-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;grid-column:1/-1;margin-top:4px}
.isx-filter{display:inline-flex}
.isx-filter select{height:28px;padding:0 24px 0 9px;border:1px solid var(--isx-line);background:var(--isx-paper);color:var(--isx-text-2);font-family:var(--isx-font);font-size:12px;border-radius:2px;cursor:pointer;appearance:none}
.isx-refbox{margin-top:10px;padding:10px 12px;border:1px dashed var(--isx-line-strong);border-radius:2px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.isx-refbox .th{width:44px;height:44px;border-radius:2px;object-fit:cover;border:1px solid var(--isx-line)}
.isx-refbox .txt{flex:1;min-width:160px;font-size:12px;line-height:1.6;color:var(--isx-text-3)}
.isx-syncbar{height:3px;background:var(--isx-line-subtle);border-radius:2px;overflow:hidden;margin-top:8px}
.isx-syncbar i{display:block;height:100%;background:var(--isx-accent);transition:width .3s var(--isx-ease)}
.isx-pickslots{display:grid;gap:8px}
.isx-slot{display:grid;grid-template-columns:112px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--isx-line-subtle);border-radius:2px;background:var(--isx-paper-2);font:inherit;color:inherit}
.isx-slot .k{font-family:var(--isx-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--isx-text-3)}
.isx-slot .v{font-size:13px;color:var(--isx-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-slot .v em{font-family:var(--isx-mono);font-style:normal;color:var(--isx-accent);font-size:11px;margin-right:6px}
.isx-pickstep{max-height:min(52vh,460px);overflow:auto;border-top:1px solid var(--isx-line-subtle);padding-top:10px;margin-top:10px}
.isx-dlg-sub{font-size:12px;color:var(--isx-text-3);margin-left:10px}
.isx-credit{margin:var(--s7) 0 0;padding-top:var(--s3);border-top:1px solid var(--isx-line-subtle);font-family:var(--isx-mono);font-size:10px;color:var(--isx-text-3);letter-spacing:.03em}
.isx-credit a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.isx-libempty{padding:var(--s8) 0;text-align:center;color:var(--isx-text-3);font-size:13px}
.isx-libloading{padding:var(--s8) 0;text-align:center;color:var(--isx-text-3);font-size:13px;font-family:var(--isx-mono);letter-spacing:.05em}

/* ── 创作页：模板参考条 + 已套用条 ───────────────────────────────────── */
.isx-strip{margin:var(--s4) 0 0}
.isx-striphead{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.isx-striphead .k{font-family:var(--isx-mono);font-size:10px;letter-spacing:.08em;color:var(--isx-text-3);text-transform:uppercase}
.isx-striphead .hint{font-size:11.5px;color:var(--isx-text-3);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-striphead button{background:none;border:0;color:var(--isx-text-3);font-family:var(--isx-mono);font-size:10.5px;cursor:pointer;padding:0}
.isx-striphead button:hover{color:var(--isx-ink)}
.isx-striprow{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}
.isx-stripcard{position:relative;flex:none;width:106px;height:76px;border:1px solid var(--isx-line-subtle);padding:0;overflow:hidden;cursor:pointer;background:var(--isx-paper-2);transition:border-color .18s var(--isx-ease),transform .2s var(--isx-ease)}
.isx-stripcard img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.isx-stripcard .cap{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,transparent,rgba(8,10,14,.62) 34%,rgba(8,10,14,.96));color:#fff;font-family:var(--isx-mono);font-size:9px;line-height:1.3;letter-spacing:.02em;padding:16px 5px 4px;text-shadow:0 1px 2px rgba(0,0,0,.6);text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-stripcard:hover{border-color:var(--isx-line-strong);transform:translateY(-1px)}
.isx-stripcard.is-on{border-color:var(--isx-accent);box-shadow:0 0 0 1px var(--isx-accent)}
.isx-stripcard.is-add{display:flex;align-items:center;justify-content:center;border-style:dashed;color:var(--isx-text-3);font-size:18px;line-height:1}
.isx-stripcard.is-add:hover{color:var(--isx-ink)}
.isx-applied{display:flex;align-items:center;gap:10px;margin:var(--s3) 0 0;padding:8px 10px;border:1px solid var(--isx-line-subtle);border-left:3px solid var(--isx-accent);background:var(--isx-paper-2)}
.isx-applied img{width:34px;height:26px;object-fit:cover;flex:none;border:1px solid var(--isx-line-subtle)}
.isx-applied .txt{flex:1;min-width:0}
.isx-applied .name{font-size:12px;color:var(--isx-ink)}
.isx-applied .meta{font-family:var(--isx-mono);font-size:9.5px;color:var(--isx-text-3);letter-spacing:.03em;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-applied .acts{display:flex;gap:6px;flex:none}
.isx-applied .isx-btn{height:26px;padding:0 10px;font-size:11.5px}

/* ── 弹层（预览 / 跟做） ─────────────────────────────────────────────── */
.isx-scrim{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(6,7,10,.66);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:isx-fade .18s var(--isx-ease)}
@keyframes isx-fade{from{opacity:0}to{opacity:1}}
.isx-dialog{width:min(900px,100%);max-height:calc(100vh - 44px);display:flex;flex-direction:column;background:var(--isx-paper);border:1px solid var(--isx-line-strong);border-radius:2px;overflow:hidden;animation:isx-pop .2s var(--isx-ease)}
@keyframes isx-pop{from{opacity:0;transform:translateY(8px) scale(.995)}to{opacity:1;transform:none}}
.isx-dlg-head{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--isx-line-subtle)}
.isx-dlg-head .t{font-size:14.5px;color:var(--isx-ink)}
.isx-dlg-head .id{font-family:var(--isx-mono);font-size:10.5px;color:var(--isx-accent);border:1px solid var(--isx-line);padding:2px 7px}
.isx-dlg-head .sub{font-family:var(--isx-mono);font-size:10px;color:var(--isx-text-3);letter-spacing:.03em;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-dlg-body{display:grid;grid-template-columns:250px 1fr;gap:20px;padding:18px;overflow:auto}
.isx-dlg-fig{margin:0}
.isx-dlg-fig img{width:100%;display:block;border:1px solid var(--isx-line-subtle);object-fit:contain;background:var(--isx-paper-2);max-height:min(60vh,520px)}
.isx-dlg-fig figcaption{margin-top:9px;font-size:11px;line-height:1.65;color:var(--isx-text-3)}
.isx-k{font-family:var(--isx-mono);font-size:9.5px;letter-spacing:.08em;color:var(--isx-text-3);text-transform:uppercase;margin-bottom:7px;display:block}
.isx-paramgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.isx-param{border:1px solid var(--isx-line-subtle);padding:7px 9px;min-width:0}
.isx-param .k{font-family:var(--isx-mono);font-size:9px;letter-spacing:.06em;color:var(--isx-text-3);margin-bottom:4px}
.isx-param .v{font-size:11.5px;color:var(--isx-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-param .v em{font-style:normal;font-family:var(--isx-mono);color:var(--isx-accent);margin-right:5px}
.isx-param select,.isx-param input{width:100%;border:0;background:none;color:var(--isx-ink);font-family:inherit;font-size:11.5px;outline:none;padding:0;cursor:pointer}
.isx-param select option{background:var(--isx-paper);color:var(--isx-ink)}
.isx-fieldrow{display:flex;align-items:baseline;gap:8px;margin:14px 0 6px}
.isx-fieldrow .k{margin:0}
.isx-fieldrow .req{font-family:var(--isx-mono);font-size:9px;color:var(--isx-accent);letter-spacing:.05em}
.isx-fieldrow .opt{font-family:var(--isx-mono);font-size:9px;color:var(--isx-text-3);letter-spacing:.05em}
.isx-ta{width:100%;box-sizing:border-box;border:1px solid var(--isx-line);background:var(--isx-paper-2);color:var(--isx-ink);font-family:inherit;font-size:13px;line-height:1.6;padding:9px 10px;outline:none;resize:vertical;min-height:64px;transition:border-color .18s var(--isx-ease)}
.isx-ta:focus{border-color:var(--isx-line-strong)}
.isx-input-line{width:100%;box-sizing:border-box;border:1px solid var(--isx-line);background:var(--isx-paper-2);color:var(--isx-ink);font-family:inherit;font-size:12.5px;padding:8px 10px;outline:none;transition:border-color .18s var(--isx-ease)}
.isx-input-line:focus{border-color:var(--isx-line-strong)}
.isx-pre{margin:0;max-height:190px;overflow:auto;border:1px solid var(--isx-line-subtle);background:var(--isx-paper-2);padding:10px 12px;font-family:var(--isx-mono);font-size:10.5px;line-height:1.8;color:var(--isx-text-2);white-space:pre-wrap;word-break:break-word}
.isx-pre-tall{flex:1 1 auto;min-height:180px;max-height:none;overflow:auto;margin-top:6px}
.isx-dlg-foot{display:flex;align-items:center;gap:10px;padding:13px 18px;border-top:1px solid var(--isx-line-subtle);background:var(--isx-paper)}
.isx-dlg-foot .hint{font-size:11px;color:var(--isx-text-3);flex:1;min-width:0}
.isx-preview{width:min(1120px,100%);max-height:calc(100vh - 44px);display:flex;flex-direction:column;background:var(--isx-paper);border:1px solid var(--isx-line-strong);border-radius:2px;overflow:hidden;animation:isx-pop .2s var(--isx-ease)}
.isx-pv-head{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--isx-line-subtle)}
.isx-pv-head .t{font-size:14.5px;color:var(--isx-ink);font-weight:600}
.isx-pv-head .id{font-family:var(--isx-mono);font-size:10.5px;color:var(--isx-accent);border:1px solid var(--isx-line);padding:2px 7px}
.isx-pv-head .sub{font-family:var(--isx-mono);font-size:10px;color:var(--isx-text-3);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.isx-pv-head .isx-ibtn{margin-left:auto}
.isx-pv-body{display:grid;grid-template-columns:1fr 392px;gap:22px;padding:18px;overflow:auto}
.isx-pv-fig{margin:0;display:flex;flex-direction:column;gap:9px;min-width:0}
.isx-pv-fig img{width:100%;max-height:calc(100vh - 250px);object-fit:contain;background:var(--isx-paper-2);border:1px solid var(--isx-line-subtle)}
.isx-pv-cap{font-size:11px;line-height:1.65;color:var(--isx-text-3)}
.isx-pv-info{display:flex;flex-direction:column;min-width:0;min-height:0}
.isx-pv-foot{display:flex;align-items:center;gap:8px;padding:12px 18px;border-top:1px solid var(--isx-line-subtle)}
.isx-pv-foot .sp{flex:1}
.isx-navis-disabled{opacity:.5;cursor:default}
@media (max-width:980px){
  .isx-tpls{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
  .isx-dlg-body{grid-template-columns:1fr}
  .isx-dlg-fig img{max-height:34vh}
  .isx-paramgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .isx-pv-body{grid-template-columns:1fr}
  .isx-pv-fig img{max-height:38vh}
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

    // ── 手绘皮肤（hand-drawn skin） ─────────────────────────────────────────
    // 皮肤是独立样式表：lib/skin-handdrawn.css，由宿主在 ${API}/skin.css 提供。
    // 之所以不塞进上面的 <style>：皮肤只改观感、不参与逻辑，独立文件便于单独迭代与回退，
    // 也让浏览器能缓存它。深色主题由皮肤内的 [data-scheme='dark'] 一套变量接管。
    const SKIN_ID = 'dsh-imagine/skin.css'
    if (typeof document !== 'undefined' && document.querySelector(`link[data-plugin-css="${SKIN_ID}"]`) === null) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `${API}/skin.css?v=0.5.1`
      link.dataset.plugin = 'dsh-imagine'
      link.dataset.pluginCss = SKIN_ID
      document.head.appendChild(link)
    }

    // ── 图标 ──────────────────────────────────────────────────────────────
    // 侧栏入口直接用插件 logo（icon.png），不是线性图标。
    // 宿主按 size（默认 18）给出边长，这里显式钉住宽高，避免 512px 原图撑开。
    function PanelIcon(props) {
      const size = (props && props.size) || 18
      return h('img', {
        src: `${API}/icon.png?v=0.5.1`,
        alt: '',
        width: size,
        height: size,
        draggable: false,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
          borderRadius: `${Math.max(3, Math.round(size * 0.22))}px`,
        },
      })
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

        // 面板只有两块视图：创作台（studio）与模板库（library）。左侧栏在两个视图里都在。
        const [view, setView] = React.useState('studio')
        const [tpl, setTpl] = React.useState(null)
        const [tplError, setTplError] = React.useState(null)
        const [tplLoading, setTplLoading] = React.useState(false)
        const [assetStatus, setAssetStatus] = React.useState(null)
        const [tab, setTab] = React.useState('scenes')
        const [chip, setChip] = React.useState('all')
        const [query, setQuery] = React.useState('')
        const [preview, setPreview] = React.useState(null)
        const [previewDetail, setPreviewDetail] = React.useState(null)
        const [follow, setFollow] = React.useState(null)
        const [followDraft, setFollowDraft] = React.useState(null)
        const [composed, setComposed] = React.useState(null)
        const [composeError, setComposeError] = React.useState(null)
        const [composing, setComposing] = React.useState(false)
        const [applied, setApplied] = React.useState(null)
        const [ratio, setRatio] = React.useState('auto')
        const composeTimer = React.useRef(null)
        // P1/P2：二级筛选、收藏、最近使用、素材选择器、垫图参考、AI 与同步状态
        const [filters, setFilters] = React.useState({ mode: 'all', ratio: 'all', source: 'all' })
        const [favs, setFavs] = React.useState([])
        const [recent, setRecent] = React.useState([])
        const [picker, setPicker] = React.useState(null)
        const [pickerComposed, setPickerComposed] = React.useState(null)
        const [pickerError, setPickerError] = React.useState(null)
        const [assistBusy, setAssistBusy] = React.useState(false)
        const [assistNote, setAssistNote] = React.useState(null)
        const [reference, setReference] = React.useState(null)
        const [sync, setSync] = React.useState(null)
        const [exporting, setExporting] = React.useState(false)
        const [cacheInfo, setCacheInfo] = React.useState(null)
        const [localDirDraft, setLocalDirDraft] = React.useState('')
        const [cacheLimitDraft, setCacheLimitDraft] = React.useState('0')
        const fileInput = React.useRef(null)
        const pickerTimer = React.useRef(null)

        React.useEffect(() => {
          const el = scrollRef.current
          if (!el || typeof el.addEventListener !== 'function') return undefined
          const marks = ['prompt', 'work', 'account']
          function onScroll() {
            if (view !== 'studio') return
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
        }, [view])

        function navButton(key, icon, label, extra) {
          return h(
            'button',
            { className: view === 'studio' && activeNav === key ? 'isx-nav is-on' : 'isx-nav', onClick: () => gotoSection(key) },
            icon,
            label,
            extra || null,
          )
        }

        function navLibraryButton() {
          const count = (tpl && tpl.counts && (tpl.counts.all || tpl.counts.total + tpl.counts.curated)) || 0
          return h(
            'button',
            { className: view === 'library' ? 'isx-nav is-on' : 'isx-nav', onClick: () => openLibrary() },
            LibraryIcon(),
            lt('navLibrary'),
            count ? h('span', { className: 'count' }, String(count)) : null,
          )
        }

        function gotoSection(key) {
          setActiveNav(key)
          if (view !== 'studio') {
            setView('studio')
            setTimeout(() => scrollToSection(key), 30)
            return
          }
          scrollToSection(key)
        }

        function scrollToSection(key) {
          const el = scrollRef.current
          if (!el) return
          const node = el.querySelector(`#isx-sec-${key}`)
          if (!node) return
          const top = node.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 16
          const next = Math.max(0, Math.round(top))
          if (typeof el.scrollTo === 'function') el.scrollTo({ top: next, behavior: 'smooth' })
          else el.scrollTop = next
        }

        // ── 模板库：数据 ──────────────────────────────────────────────────
        // ── 收藏 / 最近使用（localStorage，刷新后还在） ──────────────────
        const FAV_KEY = 'dsh-imagine/handraw/favorites'
        const RECENT_KEY = 'dsh-imagine/handraw/recent'
        const RECENT_MAX = 12

        function readStoredList(key) {
          try {
            const raw = window.localStorage.getItem(key)
            const value = raw ? JSON.parse(raw) : []
            return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
          } catch {
            return []
          }
        }

        function writeStoredList(key, list) {
          try {
            window.localStorage.setItem(key, JSON.stringify(list))
          } catch {
            /* 存不下就算了，不影响使用 */
          }
        }

        React.useEffect(() => {
          setFavs(readStoredList(FAV_KEY))
          setRecent(readStoredList(RECENT_KEY))
        }, [])

        function toggleFav(id) {
          setFavs(prev => {
            const next = prev.includes(id) ? prev.filter(item => item !== id) : [id, ...prev].slice(0, 200)
            writeStoredList(FAV_KEY, next)
            return next
          })
        }

        function markRecent(id) {
          if (!id) return
          setRecent(prev => {
            const next = [id, ...prev.filter(item => item !== id)].slice(0, RECENT_MAX)
            writeStoredList(RECENT_KEY, next)
            return next
          })
        }

        async function loadTemplates(force) {
          if (tplLoading) return
          if (tpl && !force) return
          setTplLoading(true)
          setTplError(null)
          try {
            const body = await apiGet('/templates/index')
            setTpl(body)
          } catch (err) {
            setTplError(err)
          } finally {
            setTplLoading(false)
          }
          loadAssetStatus()
        }

        async function loadAssetStatus() {
          try {
            const body = await apiGet('/templates/status')
            setAssetStatus(body)
            setSync(body.sync || null)
            setCacheInfo({
              cached: body.cached || 0,
              bytes: body.bytes || 0,
              assets: body.assets || 0,
              limitMB: body.limitMB || 0,
              overLimit: Boolean(body.overLimit),
              localDir: body.localDir || '',
              localReady: Boolean(body.localReady),
            })
            if (typeof body.localDir === 'string' && !localDirDraft) setLocalDirDraft(body.localDir)
            if (body.limitMB != null && cacheLimitDraft === '0') setCacheLimitDraft(String(body.limitMB || 0))
          } catch {
            // 缓存进度读不到不影响浏览
          }
        }

        async function startSyncAssets(scope) {
          try {
            const body = await apiPost('/templates/sync', { scope: scope || 'missing' })
            setSync(body.sync || null)
            showToast(lt('syncStarted'))
          } catch (err) {
            showToast(lt('syncFailed', { message: err && err.message ? err.message : String(err) }))
          }
        }

        async function clearAssetCache() {
          try {
            await apiPost('/templates/cache', {})
            showToast(lt('cacheCleared'))
            await loadAssetStatus()
          } catch (err) {
            showToast(lt('syncFailed', { message: err && err.message ? err.message : String(err) }))
          }
        }

        // 同步进行中时轮询进度（面板打开期间）
        React.useEffect(() => {
          if (!sync || !sync.running) return undefined
          const timer = window.setInterval(() => {
            apiGet('/templates/sync')
              .then(body => setSync(body.sync || null))
              .catch(() => {})
          }, 1200)
          return () => window.clearInterval(timer)
        }, [sync && sync.running])

        async function runExportToDisk(name, ids) {
          const list = (ids || []).filter(Boolean)
          if (!list.length) {
            showToast(lt('nothingToExport'))
            return
          }
          setExporting(true)
          try {
            const body = await apiPost('/templates/export', { name, ids: list, theme: prompt.match(/主题：([^\n]+)/) ? prompt.match(/主题：([^\n]+)/)[1] : '' })
            showToast(lt('exportedToDisk', { path: body.path, count: body.count }))
            apiPost('/api/reveal', { path: body.path }).catch(() => {})
          } catch (err) {
            showToast(lt('exportFailed', { message: err && err.message ? err.message : String(err) }))
          } finally {
            setExporting(false)
          }
        }

        React.useEffect(() => {
          loadTemplates()
        }, [])

        function kindItems(kind) {
          if (!tpl || !Array.isArray(tpl.items)) return []
          return tpl.items.filter((item) => item.kind === kind)
        }

        function itemById(id) {
          if (!tpl || !Array.isArray(tpl.items)) return null
          return tpl.items.find((item) => item.id === id) || null
        }

        function curatedRows() {
          return (tpl && Array.isArray(tpl.curated)) ? tpl.curated : []
        }

        function openLibrary() {
          setView('library')
          setPreview(null)
          setFollow(null)
          if (!tpl && !tplLoading) loadTemplates()
        }

        function kindLabel(kind) {
          if (kind === 'layout') return lt('kindLayout')
          if (kind === 'style') return lt('kindStyle')
          if (kind === 'color') return lt('kindColor')
          if (kind === 'tone') return lt('kindTone')
          return ''
        }

        function modeLabel(mode) {
          return mode === 'pure-image' ? lt('modePure') : lt('modeGraphic')
        }

        function htmlToText(markdown) {
          return String(markdown || '').replace(/<[^>]+>/g, '').trim()
        }

        /** 预览/跟做用的「条目视图」：精选场景包一层，素材直接用。 */
        function entryName(entry) {
          if (!entry) return ''
          if (entry.__curated) return entry.title
          return entry.title || entry.id
        }

        function entryCover(entry) {
          if (!entry) return ''
          if (entry.__curated) {
            const layout = itemById(entry.layout)
            return coverSrc(entry.cover || (layout && layout.cover))
          }
          return coverSrc(entry.cover)
        }

        async function fetchItemBody(id) {
          try {
            const body = await apiGet(`/templates/item/${encodeURIComponent(id)}`)
            return body.item || null
          } catch {
            return null
          }
        }

        // ── 模板库：预览层 ────────────────────────────────────────────────
        async function openPreview(entry) {
          markRecent(entry.id)
          setPreview(entry)
          setPreviewDetail(null)
          const id = entry.__curated ? entry.layout : entry.id
          const detail = await fetchItemBody(id)
          setPreviewDetail(detail)
        }

        function closePreview() {
          setPreview(null)
          setPreviewDetail(null)
        }

        function previewPromptText() {
          if (!previewDetail) return ''
          const body = previewDetail.body || {}
          return body.zh || body.en || ''
        }

        // ── 模板库：一键跟做 ──────────────────────────────────────────────
        function defaultRefs(entry) {
          if (entry.__curated) {
            return {
              layout: entry.layout,
              style: entry.style,
              color: entry.color,
              tone: entry.tone,
              ratio: entry.ratio || '4:5',
              mode: entry.mode || 'graphic-text',
            }
          }
          const refs = { layout: null, style: null, color: null, tone: null, ratio: entry.ratio || '4:5', mode: 'graphic-text' }
          refs[entry.kind] = entry.id
          return refs
        }

        function openFollow(entry) {
          const refs = defaultRefs(entry)
          const draft = { source: entry, ...refs, theme: '', brief: '' }
          setFollow(entry)
          setFollowDraft(draft)
          setComposed(null)
          setComposeError(null)
          scheduleCompose(draft)
        }

        function closeFollow() {
          setFollow(null)
          setFollowDraft(null)
          setComposed(null)
          setComposeError(null)
        }

        function scheduleCompose(draft) {
          if (composeTimer.current) clearTimeout(composeTimer.current)
          if (!draft || !String(draft.theme || '').trim()) {
            setComposed(null)
            setComposeError(null)
            return
          }
          composeTimer.current = setTimeout(() => {
            runCompose(draft)
          }, 220)
        }

        async function runCompose(draft) {
          setComposing(true)
          try {
            const payload = {
              layout: draft.layout || undefined,
              style: draft.style || undefined,
              color: draft.color || undefined,
              tone: draft.tone || undefined,
              ratio: draft.ratio || undefined,
              mode: draft.mode || undefined,
              theme: String(draft.theme || '').trim(),
              brief: String(draft.brief || '').trim() || undefined,
            }
            const body = await apiPost('/templates/compose', payload)
            setComposed(body)
            setComposeError(null)
          } catch (err) {
            setComposed(null)
            setComposeError(err)
          } finally {
            setComposing(false)
          }
        }

        function updateFollow(patch) {
          setFollowDraft((prev) => {
            if (!prev) return prev
            const next = { ...prev, ...patch }
            scheduleCompose(next)
            return next
          })
        }

        function applyFollow() {
          if (!followDraft) return
          const theme = String(followDraft.theme || '').trim()
          if (!theme) {
            showToast(lt('needTheme'))
            return
          }
          if (composed && composed.prompt) {
            setPrompt(composed.prompt)
          } else {
            runCompose(followDraft)
            return
          }
          const nextRatio = followDraft.ratio || 'auto'
          setRatio(nextRatio)
          setSize(sizeForRatio(nextRatio))
          setApplied({
            id: follow.__curated ? follow.id : follow.id,
            name: entryName(follow),
            refs: { ...followDraft, source: undefined },
            cover: entryCover(follow),
            theme,
            mode: (composed && composed.mode) || followDraft.mode,
          })
          markRecent(follow.id)
          closeFollow()
          setView('studio')
          setActiveNav('prompt')
          setTimeout(() => scrollToSection('prompt'), 30)
        }

        // ── 导出 ──────────────────────────────────────────────────────────
        function exportMarkdown(payload) {
          const version = (tpl && tpl.version) || (status && status.templateVersion) || ''
          const text = buildMarkdown({ ...payload, version })
          const safe = (payload.name || payload.id || 'template')
            .replace(/[\\/:*?"<>|\s]+/g, '-')
            .slice(0, 40)
          saveTextFile(`handraw-${payload.id || 'template'}-${safe}.md`, text)
          showToast(lt('exported'))
        }

        function exportFromPreview() {
          if (!preview) return
          const refs = defaultRefs(preview)
          const params = Object.entries(refs)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ')
          exportMarkdown({
            id: preview.__curated ? preview.layout : preview.id,
            name: entryName(preview),
            title: preview.__curated ? `${preview.id} ${preview.title}` : `${preview.id} ${preview.title}`,
            params,
            prompt: previewPromptText(),
          })
        }

        function exportFromFollow() {
          if (!followDraft || !composed) return
          const params = Object.entries(composed.refs || {})
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ')
          exportMarkdown({
            id: followDraft.source && followDraft.source.__curated ? followDraft.source.id : (followDraft.layout || followDraft.style || followDraft.color || followDraft.tone || 'prompt'),
            name: followDraft.source ? entryName(followDraft.source) : 'prompt',
            params,
            prompt: composed.prompt,
          })
        }

        function exportFromApplied() {
          if (!applied) return
          const params = Object.entries(applied.refs || {})
            .filter(([key, value]) => value && key !== 'source')
            .map(([key, value]) => `${key}=${value}`)
            .join(', ')
          exportMarkdown({
            id: applied.id,
            name: applied.name,
            params,
            prompt,
          })
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
            if (s.defaultSize) { setSize(s.defaultSize); setRatio(ratioFromSize(s.defaultSize)) }
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
            const payload = { prompt: text, size, background }
            if (reference && reference.dataUrl) payload.reference = reference.dataUrl
            const body = await apiPost('/api/generate', payload)
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
            const body = await apiPost('/api/settings', {
              proxy: proxyValue,
              codexPath: codexPathDraft,
              handrawLocalDir: localDirDraft.trim(),
              cacheLimitMB: Math.trunc(Number(cacheLimitDraft) || 0),
            })
            setStatus((prev) => (prev ? { ...prev, settings: body.settings } : prev))
            showToast(t('saved'))
            setShowSettings(false)
            loadStatus(true)
            loadAssetStatus()
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

        React.useEffect(() => {
          if (!preview && !follow && !picker) return undefined
          const onKey = (event) => {
            if (event.key === 'Escape') {
              if (picker) closePicker()
              else if (follow) closeFollow()
              else if (preview) closePreview()
              return
            }
            if (preview && !follow && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
              event.preventDefault()
              stepPreview(event.key === 'ArrowLeft' ? -1 : 1)
            }
          }
          window.addEventListener('keydown', onKey)
          return () => window.removeEventListener('keydown', onKey)
        }, [preview, follow, picker])

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

        function LibraryIcon() {
          return h(
            'svg',
            { viewBox: '0 0 24 24' },
            h('rect', { x: '3.6', y: '4', width: '7', height: '7', rx: '.8' }),
            h('rect', { x: '13.4', y: '4', width: '7', height: '7', rx: '.8' }),
            h('rect', { x: '3.6', y: '13', width: '7', height: '7', rx: '.8' }),
            h('rect', { x: '13.4', y: '13', width: '7', height: '7', rx: '.8' }),
          )
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

        // ── 模板库：渲染 ──────────────────────────────────────────────────
        function tabCounts() {
          const counts = (tpl && tpl.counts) || {}
          return {
            scenes: counts.curated || 0,
            layout: counts.layout || 0,
            style: counts.style || 0,
            color: (counts.color || 0) + (counts.tone || 0),
          }
        }

        function domainLabelOf(row) {
          const dict = (LIB[currentLang] || LIB.zh).domains || {}
          return dict[row.domain] || row.domainLabel || row.domain || ''
        }

        function libChips() {
          const groups = (tpl && tpl.groups) || {}
          if (tab === 'scenes') {
            const rows = curatedRows()
            const chips = [{ key: 'all', label: lt('chipAll'), count: rows.length }]
            const seen = new Map()
            rows.forEach((row) => {
              const entry = seen.get(row.domain) || { key: row.domain, label: domainLabelOf(row), count: 0 }
              entry.count += 1
              seen.set(row.domain, entry)
            })
            return chips.concat([...seen.values()])
          }
          if (tab === 'layout') {
            const list = groups.layout || []
            return [{ key: 'all', label: lt('chipAll'), count: tabCounts().layout }].concat(list.map((group) => ({ key: group.key, label: group.label, count: group.count, group: 'layout' })))
          }
          if (tab === 'style') {
            const list = groups.style || []
            return [{ key: 'all', label: lt('chipAll'), count: tabCounts().style }].concat(
              list.map((group) => ({ key: group.key, label: group.label, count: group.count, group: 'style' })),
            )
          }
          const colors = (groups.color || []).map((group) => ({ ...group, group: 'color' }))
          const tones = (groups.tone || []).map((group) => ({ ...group, group: 'tone' }))
          return [{ key: 'all', label: lt('chipAll'), count: tabCounts().color }].concat(colors, tones)
        }

        /** 收藏 / 最近使用两个来源筛选（对剧本与素材都生效）。 */
        function passSource(row) {
          const source = filters.source || 'all'
          if (source === 'fav') return favs.includes(row.id)
          if (source === 'recent') return recent.includes(row.id)
          return true
        }

        function passFilters(row) {
          if (filters.mode && filters.mode !== 'all') {
            const rowMode = row.__curated ? row.mode : row.kind === 'layout' ? 'graphic-text' : ''
            if (rowMode && rowMode !== filters.mode) return false
          }
          if (filters.ratio && filters.ratio !== 'all') {
            const rowRatio = row.ratio || (row.__curated ? row.ratio : '')
            if (rowRatio && rowRatio !== filters.ratio) return false
          }
          return passSource(row)
        }

        function libList() {
          if (!tpl) return []
          const keyword = String(query || '').trim().toLowerCase()
          const match = (row, extra) => {
            if (!keyword) return true
            const haystack = [row.id, row.title, row.titleEn, row.categoryLabel, row.group, extra]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
            if (haystack.includes(keyword)) return true
            if (Array.isArray(row.keywords) && row.keywords.join(' ').toLowerCase().includes(keyword)) return true
            return false
          }
          if (tab === 'scenes') {
            return curatedRows()
              .filter((row) => chip === 'all' || row.domain === chip)
              .filter((row) => passFilters({ ...row, __curated: true }))
              .filter((row) => {
                const layout = itemById(row.layout)
                const style = itemById(row.style)
                return match(
                  { ...row, titleEn: '', categoryLabel: domainLabelOf(row), group: '' },
                  `${row.themeHint || ''} ${row.layout} ${row.style} ${row.color} ${row.tone} ${layout ? layout.title : ''} ${style ? style.title : ''}`,
                )
              })
              .map((row) => ({ ...row, __curated: true }))
          }
          let items = (tpl.items || []).filter((item) => {
            if (tab === 'layout') return item.kind === 'layout'
            if (tab === 'style') return item.kind === 'style'
            return item.kind === 'color' || item.kind === 'tone'
          })
          if (chip !== 'all') {
            const found = libChips().find((entry) => entry.key === chip)
            if (found) items = items.filter((item) => item.kind === found.group && item.category === chip)
          }
          return items.filter((item) => passFilters(item)).filter((item) => match(item, ''))
        }

        function templateCard(entry, index) {
          const isCurated = Boolean(entry.__curated)
          const idLine = isCurated
            ? `${entry.id} · ${domainLabelOf(entry)}`
            : `${kindLabel(entry.kind)} · ${entry.categoryLabel || ''}`
          const tag = isCurated ? `${entry.layout} · ${entry.ratio}` : `${entry.id}${entry.ratio ? ` · ${entry.ratio}` : ''}`
          const meta = isCurated
            ? `${modeLabel(entry.mode)} · ${entry.style} · ${entry.color} · ${entry.tone}`
            : `${entry.chars} ${lt('charsUnit')}${entry.ratio ? ` · ${lt('suggest')} ${entry.ratio}` : ''}`
          return h(
            'article',
            { className: 'isx-tpl', key: isCurated ? entry.id : `${entry.kind}-${entry.id}`, style: { '--d': `${Math.min(index, 12) * 28}ms` } },
            h(
              'div',
              { className: 'isx-tplimg', onClick: () => openPreview(entry), title: entryName(entry) },
              h('img', { src: entryCover(entry), alt: entryName(entry), loading: 'lazy' }),
              h('span', { className: 'tag' }, tag),
              h(
                'button',
                {
                  className: favs.includes(entry.id) ? 'isx-fav is-on' : 'isx-fav',
                  title: favs.includes(entry.id) ? lt('favOn') : lt('favOff'),
                  'aria-pressed': favs.includes(entry.id),
                  onClick: (event) => {
                    event.stopPropagation()
                    toggleFav(entry.id)
                  },
                },
                favs.includes(entry.id) ? '★' : '☆',
              ),
            ),
            h(
              'div',
              { className: 'isx-tplbody' },
              h('div', { className: 'isx-tplid' }, idLine),
              h('h3', { className: 'isx-tplname' }, entryName(entry)),
              h('div', { className: 'isx-tplmeta' }, meta),
            ),
            h(
              'div',
              { className: 'isx-tplacts' },
              h('button', { className: 'isx-btn is-accent', onClick: () => openFollow(entry) }, lt('follow')),
              h('button', { className: 'isx-btn is-ghost', onClick: () => openPreview(entry) }, lt('openPreview')),
            ),
          )
        }

        function filterSelect(key, options) {
          const value = filters[key] || 'all'
          return h(
            'label',
            { className: 'isx-filter' },
            h(
              'select',
              {
                value,
                onChange: (event) => setFilters({ ...filters, [key]: event.target.value }),
              },
              options.map(([optionKey, label]) => h('option', { key: optionKey, value: optionKey }, label)),
            ),
          )
        }

        function renderLibrary() {
          const counts = tabCounts()
          const chips = libChips()
          const list = libList()
          const tabs = [
            ['scenes', lt('tabScenes'), counts.scenes],
            ['layout', lt('tabLayout'), counts.layout],
            ['style', lt('tabStyle'), counts.style],
            ['color', lt('tabColor'), counts.color],
          ]
          const total = (tpl && tpl.counts && tpl.counts.total) || 0
          return h(
            'section',
            { className: 'isx-sec', id: 'isx-sec-library' },
            h(
              'header',
              { className: 'isx-head', style: { paddingBottom: 0 } },
              h(
                'div',
                { className: 'isx-headrow' },
                h(
                  'div',
                  null,
                  eyebrow(`${lt('eyebrow')}${tpl && tpl.version ? ` · V${tpl.version}` : ''}`),
                  h('h1', null, lt('libTitle')),
                  h('p', null, lt('libLead')),
                ),
                h(
                  'div',
                  { className: 'isx-headtools' },
                  h(
                    'div',
                    { className: 'isx-libcount', style: { textAlign: 'right', lineHeight: 1.9 } },
                    h(
                      'div',
                      null,
                      sync && sync.running
                        ? lt('syncRunning', { done: sync.done, total: sync.total, percent: sync.percent })
                        : lt('cacheLabel', {
                            cached: (assetStatus && assetStatus.cached) || 0,
                            total: (tpl && tpl.counts && tpl.counts.total) || total,
                          }),
                    ),
                    h('div', null, lt('sourceVersion', { version: (tpl && tpl.version) || '—' })),
                  ),
                  h(
                    'button',
                    {
                      className: 'isx-btn is-ghost',
                      onClick: () => startSyncAssets('missing'),
                      disabled: Boolean(sync && sync.running),
                    },
                    sync && sync.running ? `⋯ ${lt('syncRunning', { done: sync.done, total: sync.total, percent: sync.percent })}` : `↓ ${lt('syncAssets')}`,
                  ),
                  h(
                    'button',
                    { className: 'isx-btn is-ghost', onClick: () => { loadTemplates(true); loadAssetStatus() }, disabled: tplLoading },
                    `⟳ ${lt('cacheRefresh')}`,
                  ),
                ),
              ),
            ),
            h(
              'div',
              { className: 'isx-libbar' },
              h(
                'div',
                { className: 'isx-tabs', role: 'tablist' },
                tabs.map(([key, label, count]) =>
                  h(
                    'button',
                    {
                      key,
                      role: 'tab',
                      'aria-selected': tab === key,
                      className: tab === key ? 'isx-tab is-on' : 'isx-tab',
                      onClick: () => {
                        setTab(key)
                        setChip('all')
                      },
                    },
                    label,
                    h('span', { className: 'n' }, String(count)),
                  ),
                ),
              ),
            ),
            h(
              'div',
              { className: 'isx-libmetabar' },
              h(
                'div',
                { className: 'isx-chips' },
                chips.map((entry) =>
                  h(
                    'button',
                    { key: entry.key, className: chip === entry.key ? 'isx-chip is-on' : 'isx-chip', onClick: () => setChip(entry.key) },
                    entry.label,
                    h('span', { className: 'n' }, String(entry.count)),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'isx-searching' },
                h('svg', { viewBox: '0 0 24 24' }, h('circle', { cx: '11', cy: '11', r: '6.4' }), h('path', { d: 'M16 16l4.2 4.2' })),
                h('input', {
                  value: query,
                  placeholder: lt('searchPlaceholder'),
                  onChange: (event) => setQuery(event.target.value),
                }),
              ),
              h('span', { className: 'isx-libcount' }, `${lt('totalItems', { count: list.length })} · ${lt('sortHint')}`),
              h(
                'div',
                { className: 'isx-filters' },
                filterSelect('source', [
                  ['all', lt('sourceAll')],
                  ['fav', lt('sourceFav', { n: favs.length })],
                  ['recent', lt('sourceRecent', { n: recent.length })],
                ]),
                filterSelect('mode', [
                  ['all', `${lt('filterMode')}·${lt('filterAll')}`],
                  ['graphic-text', lt('modeGraphic')],
                  ['pure-image', lt('modePure')],
                ]),
                filterSelect('ratio', [
                  ['all', `${lt('filterRatio')}·${lt('filterAll')}`],
                  ['3:4', '3:4'],
                  ['4:5', '4:5'],
                  ['1:1', '1:1'],
                  ['16:9', '16:9'],
                  ['9:16', '9:16'],
                  ['4:3', '4:3'],
                ]),
                h(
                  'button',
                  {
                    className: 'isx-btn is-ghost',
                    disabled: exporting,
                    onClick: () => runExportToDisk(
                      tab === 'scenes' ? 'handraw-scenes' : `handraw-${tab}`,
                      libList().slice(0, 400).map(row => row.id),
                    ),
                  },
                  `↧ ${lt('exportFiltered')}`,
                ),
                h(
                  'button',
                  {
                    className: 'isx-btn is-ghost',
                    disabled: exporting,
                    onClick: () => runExportToDisk('handraw-curated-60', curatedRows().map(row => row.id)),
                  },
                  `↧ ${lt('exportAll')}`,
                ),
              ),
            ),
            tplLoading && !tpl
              ? h('div', { className: 'isx-libloading' }, lt('loading'))
              : tplError
                ? h(
                    'div',
                    { className: 'isx-libempty' },
                    `${lt('loadFailed')}：${tplError.message || tplError}`,
                    h('div', { style: { marginTop: '12px' } }, h('button', { className: 'isx-btn is-ghost', onClick: () => loadTemplates(true) }, lt('retry'))),
                  )
                : h(
                    'div',
                    null,
                    h('div', { className: 'isx-libcount', style: { marginTop: '14px' } }, tab === 'scenes' ? lt('scenesHint') : lt('assetsHint')),
                    list.length
                      ? h('div', { className: 'isx-tpls' }, list.map((entry, index) => templateCard(entry, index)))
                      : h('div', { className: 'isx-libempty' }, lt('empty')),
                  ),
            h(
              'div',
              { className: 'isx-credit' },
              lt('credit'),
              ' · ',
              h('a', { href: HANDRAW_REPO, target: '_blank', rel: 'noreferrer noopener' }, 'github.com/yang0/handraw-style'),
            ),
          )
        }

        // ── 创作页：模板参考条 ────────────────────────────────────────────
        function renderStrip() {
          const rows = curatedRows().slice(0, 5)
          const appliedId = applied && applied.id
          return h(
            'div',
            { className: 'isx-strip' },
            h(
              'div',
              { className: 'isx-striphead' },
              h('span', { className: 'k' }, lt('stripLabel')),
              h('span', { className: 'hint' }, lt('stripHint')),
              h(
                'button',
                { onClick: () => openLibrary() },
                lt('stripAll', { count: curatedRows().length || 60 }),
              ),
            ),
            h(
              'div',
              { className: 'isx-striprow' },
              rows.map((row) =>
                h(
                  'button',
                  {
                    key: row.id,
                    className: appliedId === row.id ? 'isx-stripcard is-on' : 'isx-stripcard',
                    title: `${row.title} · ${row.layout} / ${row.style} / ${row.color} / ${row.tone}`,
                    onClick: () => openFollow({ ...row, __curated: true }),
                  },
                  h('img', { src: coverSrc(row.cover), alt: row.title, loading: 'lazy' }),
                  h('span', { className: 'cap' }, `${row.id} ${row.title}`),
                ),
              ),
              h(
                'button',
                { className: 'isx-stripcard is-add', title: lt('stripAll', { count: curatedRows().length || 60 }), onClick: () => openLibrary() },
                '+',
              ),
            ),
          )
        }

        function renderApplied() {
          if (!applied) return null
          return h(
            'div',
            { className: 'isx-applied' },
            applied.cover ? h('img', { src: applied.cover, alt: '' }) : null,
            h(
              'div',
              { className: 'txt' },
              h('div', { className: 'name' }, applied.name),
              h(
                'div',
                { className: 'meta' },
                [
                  applied.custom ? null : applied.id,
                  applied.refs.layout,
                  applied.refs.style,
                  applied.refs.color,
                  applied.refs.tone,
                  applied.refs.character ? `${applied.refs.character}·${lt('pickerSlotCharacter')}` : null,
                  applied.refs.scene ? `${applied.refs.scene}·${lt('pickerSlotScene')}` : null,
                  applied.refs.ratio,
                  applied.refs.mode === 'pure-image' ? lt('modePure') : lt('modeGraphic'),
                ]
                  .filter(Boolean)
                  .join(' · '),
              ),
            ),
            h(
              'div',
              { className: 'acts' },
              h('button', { className: 'isx-btn is-ghost', onClick: () => setApplied(null) }, lt('clear')),
              h('button', { className: 'isx-btn is-ghost', onClick: () => exportFromApplied() }, lt('exportMd')),
            ),
          )
        }

        function capabilityHint() {
          const state = status && status.capability ? status.capability.state : 'unknown'
          if (state === 'forbidden') return lt('capabilityForbidden')
          if (state === 'ok') return lt('capabilityOk')
          return ''
        }

        function renderReferenceBox() {
          const input = h('input', {
            ref: fileInput,
            type: 'file',
            accept: 'image/png,image/jpeg,image/webp',
            style: { display: 'none' },
            onChange: onPickReference,
          })
          if (!reference) {
            return h(
              'div',
              { className: 'isx-refbox' },
              input,
              h('span', { className: 'txt' }, `${lt('referenceTitle')} · ${lt('referenceHint')}`),
              h('button', { className: 'isx-btn is-ghost', onClick: () => fileInput.current && fileInput.current.click() }, lt('referencePick')),
            )
          }
          return h(
            'div',
            { className: 'isx-refbox' },
            input,
            h('img', { className: 'th', src: reference.dataUrl, alt: '' }),
            h('span', { className: 'txt' }, lt('referenceReady', { size: formatBytes(reference.size) })),
            h('button', { className: 'isx-btn is-ghost', onClick: () => fileInput.current && fileInput.current.click() }, lt('referencePick')),
            h('button', { className: 'isx-btn is-ghost', onClick: () => setReference(null) }, lt('referenceClear')),
          )
        }

        function onPickReference(event) {
          const file = event.target && event.target.files ? event.target.files[0] : null
          if (event.target) event.target.value = ''
          if (!file) return
          if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
            showToast(lt('referenceBad'))
            return
          }
          if (file.size > 12 * 1024 * 1024) {
            showToast(lt('referenceTooBig'))
            return
          }
          const reader = new window.FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') setReference({ dataUrl: reader.result, size: file.size, name: file.name })
          }
          reader.readAsDataURL(file)
        }

        function renderPromptSection() {
          return h(
            'section',
            { className: 'isx-sec', id: 'isx-sec-prompt' },
            h(
              'div',
              { className: 'isx-sec-head' },
              h('span', { className: 'num' }, '01'),
              h('h2', null, t('prompt')),
              applied ? h('span', { className: 'more' }, lt('appliedHint')) : null,
            ),
            renderStrip(),
            renderApplied(),
            renderReferenceBox(),
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
                  {
                    className: 'isx-select',
                    value: ratio,
                    onChange: (event) => {
                      const key = event.target.value
                      setRatio(key)
                      setSize(sizeForRatio(key))
                    },
                    title: lt('ratio'),
                  },
                  RATIOS.map((option) =>
                    h(
                      'option',
                      { key: option.key, value: option.key },
                      option.key === 'auto' ? t('sizeAuto') : ratioLabel(option.key),
                    ),
                  ),
                ),
                h(
                  'select',
                  { className: 'isx-select', value: background, onChange: (event) => setBackground(event.target.value), title: t('background') },
                  h('option', { value: 'opaque' }, t('bgOpaque')),
                  h('option', { value: 'transparent' }, t('bgTransparent')),
                ),
                h('span', { className: 'isx-grow' }),
                h(
                  'button',
                  { className: 'isx-btn is-ghost', onClick: () => openPicker() },
                  lt('pickerOpen'),
                ),
                h('span', { className: 'isx-hint' }, busy ? `${elapsed}s` : capabilityHint() || t('sizeHint')),
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

        // ── 弹层：预览层 / 跟做对话框 ─────────────────────────────────────
        function ratioFromSize(value) {
          const found = RATIOS.find((option) => option.size === value)
          return found ? found.key : 'auto'
        }

        function previewKey(entry) {
          return entry.__curated ? `curated-${entry.id}` : `${entry.kind}-${entry.id}`
        }

        function stepPreview(dir) {
          const list = libList()
          if (!list.length || !preview) return
          const key = previewKey(preview)
          let index = list.findIndex((row) => previewKey(row) === key)
          if (index < 0) index = 0
          openPreview(list[(index + dir + list.length) % list.length])
        }

        async function copyPreview() {
          const text = previewPromptText()
          if (!text) return
          try {
            await navigator.clipboard.writeText(text)
          } catch {
            // 无剪贴板权限时仍然提示，用户可手动选中
          }
          showToast(lt('copied'))
        }

        function previewIndexLabel() {
          const list = libList()
          const key = preview ? previewKey(preview) : ''
          const index = list.findIndex((row) => previewKey(row) === key)
          return `${index < 0 ? 1 : index + 1} / ${list.length}`
        }

        function previewParams() {
          if (!preview) return []
          const short = (id) => {
            const item = itemById(id)
            return item ? item.title : ''
          }
          if (preview.__curated) {
            return [
              [lt('kindLayout'), preview.layout, short(preview.layout)],
              [lt('ratio'), preview.ratio, ''],
              [lt('chars'), `${preview.chars}`, lt('charsUnit')],
              [lt('kindStyle'), preview.style, short(preview.style)],
              [lt('kindColor'), preview.color, short(preview.color)],
              [lt('kindTone'), preview.tone, short(preview.tone)],
            ]
          }
          return [
            [lt('kind'), preview.kind, kindLabel(preview.kind)],
            [lt('suggest'), preview.ratio || '—', ''],
            [lt('chars'), `${preview.chars}`, lt('charsUnit')],
            [lt('sourceVersion'), preview.categoryLabel || '—', ''],
            [lt('credit'), preview.credit || '—', ''],
            [lt('openPreview'), preview.id, ''],
          ]
        }

        // ── 素材选择器（自由组合 + 风格融合 + AI 辅助） ────────────────────
        const PICKER_KINDS = { layout: 'layout', style: 'style', color: 'color', tone: 'tone', character: 'style', scene: 'style' }

        function pickerSlotLabel(key) {
          const map = {
            layout: lt('pickerSlotLayout'),
            style: lt('pickerSlotStyle'),
            color: lt('pickerSlotColor'),
            tone: lt('pickerSlotTone'),
            character: lt('pickerSlotCharacter'),
            scene: lt('pickerSlotScene'),
          }
          return map[key] || key
        }

        function openPicker() {
          const base = applied && applied.refs ? applied.refs : {}
          const draft = {
            layout: base.layout || '',
            style: base.style || '',
            color: base.color || '',
            tone: base.tone || '',
            character: '',
            scene: '',
            ratio: base.ratio || (ratio !== 'auto' ? ratio : '4:5'),
            mode: base.mode === 'pure-image' ? 'pure-image' : 'graphic-text',
            theme: (applied && applied.theme) || '',
          }
          setPicker({ draft, step: null, query: '' })
          setPickerComposed(null)
          setPickerError(null)
          schedulePickerCompose(draft)
        }

        function closePicker() {
          setPicker(null)
          setPickerComposed(null)
          setPickerError(null)
          setAssistNote(null)
        }

        function schedulePickerCompose(draft) {
          if (pickerTimer.current) window.clearTimeout(pickerTimer.current)
          pickerTimer.current = window.setTimeout(() => {
            runPickerCompose(draft)
          }, 200)
        }

        async function runPickerCompose(draft) {
          if (!draft || !draft.style) {
            setPickerComposed(null)
            return
          }
          try {
            const payload = {
              layout: draft.layout || undefined,
              style: draft.style || undefined,
              color: draft.color || undefined,
              tone: draft.tone || undefined,
              ratio: draft.ratio || undefined,
              mode: draft.mode || undefined,
              theme: String(draft.theme || '').trim(),
            }
            if (draft.character || draft.scene) payload.fusion = { character: draft.character || undefined, scene: draft.scene || undefined }
            const body = await apiPost('/templates/compose', payload)
            setPickerComposed(body)
            setPickerError(null)
          } catch (err) {
            setPickerComposed(null)
            setPickerError(err)
          }
        }

        function updatePicker(patch) {
          setPicker(prev => {
            if (!prev) return prev
            const draft = { ...prev.draft, ...patch }
            schedulePickerCompose(draft)
            return { ...prev, draft }
          })
        }

        async function assistFollow() {
          if (!followDraft) return
          const theme = String(followDraft.theme || '').trim()
          if (!theme) {
            showToast(lt('needTheme'))
            return
          }
          setAssistBusy(true)
          try {
            const body = await apiPost('/templates/assist', { theme })
            const params = (body && body.params) || {}
            const patch = {}
            for (const key of ['layout', 'style', 'color', 'tone', 'ratio', 'mode']) {
              if (params[key]) patch[key] = params[key]
            }
            const next = { ...followDraft, ...patch }
            setFollowDraft(next)
            setAssistNote(body && body.reason ? body.reason : null)
            scheduleCompose(next)
            showToast(lt('assistDone'))
          } catch (err) {
            showToast(err && err.message ? err.message : lt('assistFailed'))
          } finally {
            setAssistBusy(false)
          }
        }

        function applyPicker() {
          if (!pickerComposed || !pickerComposed.prompt) {
            showToast(lt('pickerNeedStyle'))
            return
          }
          const refs = pickerComposed.refs || {}
          setPrompt(pickerComposed.prompt)
          setApplied({
            id: `CUSTOM-${Date.now().toString(36)}`,
            name: lt('pickerTitle'),
            refs,
            mode: pickerComposed.mode,
            theme: String((picker.draft && picker.draft.theme) || '').trim(),
            custom: true,
          })
          if (refs.ratio) {
            setRatio(refs.ratio)
            setSize(sizeForRatio(refs.ratio))
          }
          closePicker()
          setView('studio')
          showToast(lt('fillHint'))
        }

        async function pickerAssist() {
          const themeValue = String((picker && picker.draft && picker.draft.theme) || (applied && applied.theme) || '')
          if (!themeValue.trim()) {
            showToast(lt('needTheme'))
            return
          }
          setAssistBusy(true)
          setAssistNote(null)
          try {
            const body = await apiPost('/templates/assist', { theme: themeValue })
            const params = body.params || {}
            updatePicker({
              layout: params.layout || picker.draft.layout,
              style: params.style || picker.draft.style,
              color: params.color || picker.draft.color,
              tone: params.tone || picker.draft.tone,
              ratio: params.ratio || picker.draft.ratio,
              mode: params.mode || picker.draft.mode,
            })
            setAssistNote(body.reason ? lt('pickerAssistNote', { reason: body.reason }) : '')
          } catch (err) {
            showToast(err && err.message ? err.message : String(err))
          } finally {
            setAssistBusy(false)
          }
        }

        function pickerItems(step) {
          const kind = PICKER_KINDS[step]
          const keyword = String((picker && picker.query) || '').trim().toLowerCase()
          return kindItems(kind).filter(item => {
            if (!keyword) return true
            return `${item.id} ${item.title} ${item.titleEn || ''} ${item.categoryLabel || ''} ${item.group || ''}`.toLowerCase().includes(keyword)
          })
        }

        function renderPicker() {
          if (!picker) return null
          const draft = picker.draft
          const step = picker.step
          const slotRow = (key) => {
            const id = draft[key] || ''
            const item = id ? itemById(id) : null
            return h(
              'div',
              { className: 'isx-slot', key },
              h('span', { className: 'k' }, pickerSlotLabel(key)),
              h(
                'span',
                { className: 'v' },
                item ? h('em', null, item.id) : null,
                item ? item.title : lt('pickerNone'),
              ),
              h(
                'span',
                { style: { display: 'flex', gap: '6px' } },
                h(
                  'button',
                  { className: 'isx-btn is-ghost', onClick: () => setPicker({ ...picker, step: key, query: '' }) },
                  lt('pickerPick'),
                ),
                id
                  ? h('button', { className: 'isx-btn is-ghost', onClick: () => updatePicker({ [key]: '' }) }, '×')
                  : null,
              ),
            )
          }

          return h(
            'div',
            { className: 'isx-root', 'data-scheme': scheme },
            h(
              'div',
              { className: 'isx-scrim', onClick: (event) => { if (event.target === event.currentTarget) closePicker() } },
              h(
                'div',
                { className: 'isx-dialog', role: 'dialog', 'aria-label': lt('pickerTitle') },
                h(
                  'div',
                  { className: 'isx-dlg-head' },
                  h('span', { className: 't' }, lt('pickerTitle')),
                  h('span', { className: 'isx-dlg-sub' }, lt('pickerHint')),
                  h('button', { className: 'isx-ibtn', onClick: closePicker, title: lt('close') }, CloseIcon()),
                ),
                h(
                  'div',
                  { className: 'isx-dlg-body', style: { gridTemplateColumns: '1fr' } },
                  step
                    ? h(
                        'div',
                        null,
                        h(
                          'div',
                          { className: 'isx-fieldrow', style: { alignItems: 'center' } },
                          h('button', { className: 'isx-btn is-ghost', onClick: () => setPicker({ ...picker, step: null }) }, `← ${lt('pickerBack')}`),
                          h('span', { className: 'isx-k' }, pickerSlotLabel(step)),
                          h('span', { className: 'isx-grow' }),
                          h('input', {
                            className: 'isx-input',
                            value: picker.query || '',
                            placeholder: lt('searchPlaceholder'),
                            onChange: (event) => setPicker({ ...picker, query: event.target.value }),
                            style: { maxWidth: '260px' },
                          }),
                        ),
                        h(
                          'div',
                          { className: 'isx-pickstep' },
                          h(
                            'div',
                            { className: 'isx-pickslots' },
                            pickerItems(step).slice(0, 200).map(item =>
                              h(
                                'button',
                                {
                                  key: item.id,
                                  className: 'isx-slot',
                                  style: { cursor: 'pointer', textAlign: 'left' },
                                  onClick: () => {
                                    setPicker(prev => {
                                      if (!prev) return prev
                                      const draft = { ...prev.draft, [step]: item.id }
                                      schedulePickerCompose(draft)
                                      return { ...prev, draft, step: null }
                                    })
                                  },
                                },
                                h('span', { className: 'k' }, item.id),
                                h('span', { className: 'v' }, item.title),
                                h('span', { className: 'isx-k' }, item.ratio || item.categoryLabel || item.group || ''),
                              ),
                            ),
                          ),
                        ),
                      )
                    : h(
                        'div',
                        null,
                        h('div', { className: 'isx-pickslots' }, ['layout', 'style', 'color', 'tone', 'character', 'scene'].map(slotRow)),
                        h(
                          'div',
                          { className: 'isx-fieldrow', style: { marginTop: '10px' } },
                          h(
                            'select',
                            {
                              className: 'isx-select',
                              value: draft.ratio,
                              onChange: (event) => updatePicker({ ratio: event.target.value }),
                            },
                            RATIOS.filter(item => item.key !== 'auto').map(option =>
                              h('option', { key: option.key, value: option.key }, ratioLabel(option.key)),
                            ),
                          ),
                          h(
                            'select',
                            {
                              className: 'isx-select',
                              value: draft.mode,
                              onChange: (event) => updatePicker({ mode: event.target.value }),
                            },
                            h('option', { value: 'graphic-text' }, lt('modeGraphic')),
                            h('option', { value: 'pure-image' }, lt('modePure')),
                          ),
                          h('span', { className: 'isx-grow' }),
                          h(
                            'button',
                            { className: 'isx-btn is-ghost', onClick: pickerAssist, disabled: assistBusy },
                            assistBusy ? lt('pickerAssistBusy') : lt('pickerAssist'),
                          ),
                        ),
                        h('input', {
                          className: 'isx-input',
                          style: { marginTop: '10px', width: '100%' },
                          value: draft.theme || '',
                          placeholder: lt('themePlaceholder'),
                          onChange: (event) => updatePicker({ theme: event.target.value }),
                        }),
                        assistNote ? h('div', { className: 'isx-note' }, assistNote) : null,
                        h(
                          'div',
                          { style: { marginTop: '10px' } },
                          h('div', { className: 'isx-k' }, `${lt('promptPreview')} · ${pickerComposed ? lt('promptChars', { count: pickerComposed.chars }) : '—'}`),
                          h('pre', { className: 'isx-pre isx-pre-tall' }, pickerComposed ? pickerComposed.prompt : lt('pickerHint')),
                        ),
                        pickerError ? h('div', { className: 'isx-alert' }, pickerError.message || String(pickerError)) : null,
                      ),
                ),
                h(
                  'div',
                  { className: 'isx-dlg-foot' },
                  h('span', { className: 'isx-hint' }, lt('fillHint')),
                  h('button', { className: 'isx-btn is-ghost', onClick: closePicker }, lt('cancel')),
                  h('button', { className: 'isx-btn is-accent', onClick: applyPicker, disabled: !pickerComposed }, lt('pickerApply')),
                ),
              ),
            ),
          )
        }

        function renderPreviewLayer() {
          if (!preview) return null
          const body = (previewDetail && previewDetail.body) || {}
          const text = body.zh || body.en || ''
          const isCurated = Boolean(preview.__curated)
          const params = previewParams()
          return h(
            'div',
            {
              className: 'isx-scrim',
              onClick: (event) => {
                if (event.target === event.currentTarget) closePreview()
              },
            },
            h(
              'div',
              { className: 'isx-preview', role: 'dialog', 'aria-modal': 'true' },
              h(
                'div',
                { className: 'isx-pv-head' },
                h('span', { className: 't' }, lt('previewTitle')),
                h('span', { className: 'id' }, isCurated ? preview.layout : preview.id),
                h(
                  'span',
                  { className: 'sub' },
                  `${entryName(preview)} · ${isCurated ? domainLabelOf(preview) : preview.categoryLabel || ''} · ${previewIndexLabel()}`,
                ),
                h('button', { className: 'isx-ibtn', onClick: closePreview, title: lt('close') }, CloseIcon()),
              ),
              h(
                'div',
                { className: 'isx-pv-body' },
                h(
                  'figure',
                  { className: 'isx-pv-fig' },
                  h('img', { src: entryCover(preview), alt: entryName(preview) }),
                  h('figcaption', { className: 'isx-pv-cap' }, lt('exampleNote')),
                ),
                h(
                  'div',
                  { className: 'isx-pv-info' },
                  h(
                    'div',
                    { className: 'isx-paramgrid' },
                    params.map(([key, value, extra]) =>
                      h(
                        'div',
                        { className: 'isx-param', key },
                        h('div', { className: 'k' }, key),
                        h('div', { className: 'v' }, h('em', null, value || '—'), extra || ''),
                      ),
                    ),
                  ),
                  h('div', { className: 'isx-k', style: { marginTop: '16px' } }, `${lt('promptPreview')} · ${text ? `${text.length} ${lt('charsUnit')}` : lt('loading')}`),
                  h('pre', { className: 'isx-pre isx-pre-tall' }, text || '…'),
                ),
              ),
              h(
                'div',
                { className: 'isx-pv-foot' },
                h('button', { className: 'isx-btn is-ghost', onClick: () => stepPreview(-1) }, `← ${lt('prevOne')}`),
                h('button', { className: 'isx-btn is-ghost', onClick: () => stepPreview(1) }, `${lt('nextOne')} →`),
                h('span', { className: 'isx-grow' }),
                h('button', { className: 'isx-btn is-ghost', onClick: copyPreview }, lt('copy')),
                h('button', { className: 'isx-btn is-ghost', onClick: exportFromPreview }, lt('exportMd')),
                h(
                  'button',
                  {
                    className: 'isx-btn is-accent',
                    onClick: () => {
                      const entry = preview
                      closePreview()
                      openFollow(entry)
                    },
                  },
                  lt('followThis'),
                ),
              ),
            ),
          )
        }

        function refSelect(label, kind, value, options, emptyLabel) {
          return h(
            'div',
            { className: 'isx-param', key: kind },
            h('div', { className: 'k' }, label),
            h(
              'select',
              {
                value: value || '',
                onChange: (event) => updateFollow({ [kind]: event.target.value || null }),
              },
              h('option', { value: '' }, emptyLabel || '—'),
              options.map((item) => h('option', { key: item.id, value: item.id }, `${item.id} ${item.title}`)),
            ),
          )
        }

        function renderFollowLayer() {
          if (!follow || !followDraft) return null
          const draft = followDraft
          const previewText = composeError
            ? `${lt('composeFailed')}：${composeError.message || composeError}`
            : composed
              ? composed.prompt
              : composing
                ? lt('loading')
                : lt('needTheme')
          return h(
            'div',
            {
              className: 'isx-scrim',
              onClick: (event) => {
                if (event.target === event.currentTarget) closeFollow()
              },
            },
            h(
              'div',
              { className: 'isx-dialog', role: 'dialog', 'aria-modal': 'true' },
              h(
                'div',
                { className: 'isx-dlg-head' },
                h('span', { className: 't' }, lt('followTitle')),
                h('span', { className: 'id' }, follow.__curated ? follow.id : follow.id),
                h(
                  'span',
                  { className: 'sub' },
                  `${entryName(follow)} · ${follow.__curated ? follow.layout : kindLabel(follow.kind)}`,
                ),
                h('button', { className: 'isx-ibtn', onClick: closeFollow, title: lt('close') }, CloseIcon()),
              ),
              h(
                'div',
                { className: 'isx-dlg-body' },
                h(
                  'figure',
                  { className: 'isx-dlg-fig' },
                  h('img', { src: entryCover(follow), alt: entryName(follow) }),
                  h('figcaption', null, lt('exampleNote')),
                ),
                h(
                  'div',
                  null,
                  h('div', { className: 'isx-k' }, `${lt('params')} · ${lt('paramsHint')}`),
                  h(
                    'div',
                    { className: 'isx-paramgrid' },
                    refSelect(lt('kindLayout'), 'layout', draft.layout, kindItems('layout'), lt('modePure')),
                    refSelect(lt('kindStyle'), 'style', draft.style, kindItems('style'), '—'),
                    refSelect(lt('kindColor'), 'color', draft.color, kindItems('color'), '—'),
                    refSelect(lt('kindTone'), 'tone', draft.tone, kindItems('tone'), '—'),
                    h(
                      'div',
                      { className: 'isx-param' },
                      h('div', { className: 'k' }, lt('ratio')),
                      h(
                        'select',
                        { value: draft.ratio || 'auto', onChange: (event) => updateFollow({ ratio: event.target.value }) },
                        RATIOS.map((option) =>
                          h('option', { key: option.key, value: option.key }, option.key === 'auto' ? t('sizeAuto') : ratioLabel(option.key)),
                        ),
                      ),
                    ),
                    h(
                      'div',
                      { className: 'isx-param' },
                      h('div', { className: 'k' }, lt('mode')),
                      h(
                        'select',
                        { value: draft.mode || 'graphic-text', onChange: (event) => updateFollow({ mode: event.target.value }) },
                        h('option', { value: 'graphic-text' }, lt('modeGraphic')),
                        h('option', { value: 'pure-image' }, lt('modePure')),
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'isx-fieldrow' },
                    h('span', { className: 'k' }, lt('theme')),
                    h('span', { className: 'req' }, lt('themeRequired')),
                  ),
                  h('textarea', {
                    className: 'isx-ta',
                    rows: 2,
                    value: draft.theme,
                    placeholder: lt('themePlaceholder'),
                    onChange: (event) => updateFollow({ theme: event.target.value }),
                  }),
                  h(
                    'div',
                    { className: 'isx-fieldrow' },
                    h('span', { className: 'k' }, lt('brief')),
                    h('span', { className: 'opt' }, lt('briefOptional')),
                  ),
                  h('input', {
                    className: 'isx-input-line',
                    value: draft.brief,
                    placeholder: lt('briefPlaceholder'),
                    onChange: (event) => updateFollow({ brief: event.target.value }),
                  }),
                  h(
                    'div',
                    { className: 'isx-k', style: { marginTop: '16px' } },
                    `${lt('promptPreview')} · ${composed ? `${composed.chars} ${lt('charsUnit')}` : composing ? lt('loading') : '—'}`,
                  ),
                  h('pre', { className: 'isx-pre isx-pre-tall' }, previewText),
                ),
              ),
              h(
                'div',
                { className: 'isx-dlg-foot' },
                h('span', { className: 'hint' }, lt('fillHint')),
                h(
                  'button',
                  { className: 'isx-btn is-ghost', onClick: assistFollow, disabled: assistBusy || !followDraft || !String(followDraft.theme || '').trim() },
                  assistBusy ? lt('assistBusy') : lt('assist'),
                ),
                h(
                  'button',
                  { className: 'isx-btn is-ghost', onClick: exportFromFollow, disabled: !composed },
                  lt('exportMd'),
                ),
                h('button', { className: 'isx-btn is-ghost', onClick: closeFollow }, lt('cancel')),
                h(
                  'button',
                  { className: 'isx-btn is-accent', onClick: applyFollow, disabled: !composed || composing },
                  lt('fillToStudio'),
                ),
              ),
            ),
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
            h(
              'div',
              { className: 'isx-field' },
              h('label', null, lt('localDir')),
              h('input', {
                className: 'isx-input',
                value: localDirDraft,
                placeholder: '/Users/you/handraw-style',
                onChange: (event) => setLocalDirDraft(event.target.value),
              }),
              h('div', { className: 'isx-note', style: { marginTop: '6px' } }, lt('localDirHint')),
              cacheInfo && cacheInfo.localReady ? h('div', { className: 'isx-note', style: { color: 'var(--isx-accent)' } }, lt('localDirOk')) : null,
            ),
            h(
              'div',
              { className: 'isx-field' },
              h('label', null, lt('cacheTitle')),
              h('div', { className: 'isx-note' },
                lt('cacheLine', {
                  cached: (cacheInfo && cacheInfo.cached) || 0,
                  total: (assetStatus && assetStatus.assets) || (assetStatus && assetStatus.total) || 0,
                  size: formatBytes((cacheInfo && cacheInfo.bytes) || 0),
                }),
              ),
              h('input', {
                className: 'isx-input',
                style: { marginTop: '6px', maxWidth: '160px' },
                value: cacheLimitDraft,
                inputMode: 'numeric',
                onChange: (event) => setCacheLimitDraft(event.target.value.replace(/[^0-9]/g, '')),
                placeholder: '0',
              }),
              h('div', { className: 'isx-note', style: { marginTop: '6px' } }, lt('cacheLimit')),
              h(
                'div',
                { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                h('button', { className: 'isx-btn is-ghost', onClick: () => clearAssetCache(), disabled: Boolean(sync && sync.running) }, lt('cacheClear')),
                h('button', { className: 'isx-btn is-ghost', onClick: () => startSyncAssets('all'), disabled: Boolean(sync && sync.running) }, lt('syncFull')),
              ),
              sync && sync.running
                ? h('div', { className: 'isx-syncbar' }, h('i', { style: { width: `${sync.percent || 0}%` } }))
                : null,
            ),
            h(
              'div',
              { className: 'isx-field' },
              h('label', null, lt('capabilityTitle')),
              h(
                'div',
                { className: 'isx-note' },
                capabilityHint() || lt('capabilityUnknown'),
              ),
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
                h('div', { className: 'isx-brandmark' }, h('img', { src: `${API}/icon.png?v=0.5.1`, alt: '', loading: 'lazy' })),
                h(
                  'div',
                  { className: 'isx-brandtext' },
                  h('div', { className: 'isx-brandname' }, t('title')),
                  h('div', { className: 'isx-brandpkg' }, 'dsh-imagine'),
                ),
              ),
              h('div', { className: 'isx-railgroup' }, t('railCreate')),
              navButton('prompt', PromptIcon(), t('navGenerate')),
              navLibraryButton(),
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
                h('b', null, `${String(t('title')).toUpperCase()} ${(status && status.version) || '0.5.1'}`),
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
                view === 'library' ? renderLibrary() : h(
                  'div',
                  null,
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
          ),
          toast ? h('div', { className: 'isx-toast' }, toast) : null,
          viewer,
          renderPreviewLayer(),
          renderFollowLayer(),
          renderPicker(),
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
