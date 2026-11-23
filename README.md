# Image Studio · 生图工坊

<p align="center">
  <img src="docs/logo.png" width="128" alt="Image Studio">
</p>

DeepSeek Harness 插件：读取本机 Codex（ChatGPT 订阅）账号额度，并用这份订阅的生图能力出图。

- 侧栏一个独立面板：左侧栏分「生成图片 / 历史作品 / 账号与设置」三块，提示词 → PNG → 历史
- 面板跟随 DSH 浅色 / 深色主题，支持中英文切换
- 账号额度：套餐、本周已用百分比、重置时间、重置卡
- 两个工具供模型调用：`image_studio_generate`、`image_studio_quota`
- 零 npm 依赖，纯 Node 内置模块；图片与历史只存本机

## 界面

| 深色 | 浅色 |
| --- | --- |
| ![深色](docs/shots/panel-dark.png) | ![浅色](docs/shots/panel-light.png) |

![历史作品](docs/shots/history-dark.png)

## 安装

在 DSH 的插件管理里安装本包（linked 目录安装即可用于开发）：

```
plugin_manager: install_bundle, target: <本包绝对目录>
```

安装后侧栏出现「生图工坊」图标。Host 半在 `/image-studio` 挂同源 HTTP 路由，面板通过它读取额度、生图、取图。

## 前置条件

1. 本机有 Codex CLI 且已用 ChatGPT 账号登录：`codex login status` → `Logged in using ChatGPT`。
2. 可访问 `chatgpt.com`；需要代理时插件会自动探测本地代理端口（7890/7897/1087/…），也可在面板设置里手动指定。

## 结构

```
package.json          # dsh.bundle.patch + dsh.client.platform = web
cordis.patch.yml      # 插入 image-studio 一行
lib/index.js          # Host：webServer prefix 路由 + 两个工具
lib/client.js         # Client：侧栏图标 + 主面板（React，无 JSX）
lib/net.js            # 代理感知 HTTPS（CONNECT 隧道 + 手写 HTTP/1.1）
lib/codex.js          # Codex app-server JSON-RPC 额度 + 生图请求
lib/providers.js      # provider 注册表（codex 已实现，其余占位）
lib/store.js          # 设置、图片索引、PNG/JPEG/WEBP 尺寸嗅探
lib/paths.js          # $DSH_HOME / $CODEX_HOME 路径
locale/{zh,en}.json   # 插件市场显示用的标题与描述
docs/DETAIL.md        # 插件详情页文档
```

## 开发自测

```bash
node test/net.mjs            # 代理探测与 HTTPS 隧道
node test/codex.mjs          # 账号、额度
node test/codex.mjs generate # 真实生图（会消耗额度）
node test/host.mjs full      # 路由与工具（含一次真实生图）
```

`test/` 只在本地开发使用，不随包发布。

## 许可

MIT
