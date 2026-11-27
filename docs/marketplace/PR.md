# Add jsnancy/dsh-imagine

Template Studio lets DSH draw with the Codex (ChatGPT) subscription quota already
signed in on the machine:

- reads the plan, weekly usage percentage and reset time through the official
  Codex `app-server` JSON-RPC (`account/rateLimits/read`) — read-only;
- generates images through the same ChatGPT backend the built-in `image_gen`
  tool uses, saving PNGs to `$DSH_HOME/image-studio/images/` with history;
- ships a panel that follows the DSH light/dark theme and switches between
  Chinese and English, plus two model tools (`image_studio_generate`,
  `image_studio_quota`);
- bundles the [handraw-style](https://github.com/yang0/handraw-style) prompt
  library (594 assets + 60 ready-made recipes) as a template library: pick a
  recipe, write one line of theme, and a deterministic composer assembles the
  prompt from upstream text, then fills it into the prompt box — with a preview
  layer, keyboard paging and `.md` export that carries the source notice;
- ships its own hand-drawn paper interface: warm paper, charcoal outlines and
  handwritten type in the light theme, dark-roast paper with chalk lines in the
  dark theme, applied as a single stylesheet (`lib/skin-handdrawn.css`) that
  touches presentation only;
- has zero runtime dependencies (the HTTP client implements its own CONNECT
  tunnel so it can use a local proxy).

`package.json` declares `dsh.bundle.patch` (`./cordis.patch.yml`) and
`dsh.client.platform = web`; the repo contains the full host + client code, a
MIT license, and screenshots in `docs/shots/`. The hand-drawn logo is a
hand-authored SVG (`docs/design/skin-handdrawn/logo.svg`) rendered to PNG, so it
can be re-rendered at any size.

---

## 0.5.0 更新（维护市场条目用）

市场数据目录里 `data/plugins/jsnancy__dsh-imagine.yml` **已经存在**（旧描述只提到
“额度 + 生图 + 历史”），这次只需要改描述，不用新增条目。可直接应用的补丁：
[`awesome-dsh-plugin.patch`](./awesome-dsh-plugin.patch)，等价内容：

```yaml
url: https://github.com/jsnancy/dsh-imagine
name: jsnancy/dsh-imagine
category: vision
description:
  en: 'Reads the Codex (ChatGPT) subscription quota already on your machine and draws with it: quota in a sidebar panel, one prompt to a local PNG with history, a hand-drawn template library (594 handraw-style assets, 60 follow-along recipes) and a hand-drawn paper interface for both light and dark themes. No API key, no extra billing.'
  zh: '读取本机已有的 Codex（ChatGPT 订阅）额度并直接生图：额度一目了然，一句话出 PNG 存本机并保留历史，还能按内置的 handraw-style 手绘模板库（594 条素材 + 60 个配方）一键跟做；界面是一套手绘纸皮肤，深浅主题各有一套。不需要 API key，不额外计费。'
icon: https://raw.githubusercontent.com/jsnancy/dsh-imagine/main/icon.png
```

提交步骤（在 <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin> 上）：
fork → 改 `data/plugins/jsnancy__dsh-imagine.yml` → 提 PR，说明用上面这段描述；
同一分支跑 `npm ci && node scripts/check-submission.mjs` 需要 `GITHUB_TOKEN`。
