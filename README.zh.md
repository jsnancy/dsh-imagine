# 生图工坊

<p align="center">
  <img src="docs/logo.png" width="128" alt="生图工坊">
</p>

DeepSeek Harness 插件：读取本机已有的 Codex（ChatGPT 订阅）额度，并用这份订阅的生图能力出图。不需要 API key，也不额外计费。

[English](README.md) · 简体中文

- **侧栏一个独立面板** —— 生成图片、历史作品、账号与设置收在同一列
- **额度直接显示** —— 套餐、本周已用百分比、重置时间与可用重置卡，走 Codex CLI 的官方接口读取
- **一句话出图** —— 写画面描述、选画布与背景、点生成；结果落成 PNG 存到本机并显示在面板里
- **留下历史** —— 每张图都记着提示词、尺寸、体积与耗时，可复制描述、在访达中显示、下载或删除
- **两个工具给模型调用** —— `image_studio_generate`、`image_studio_quota`
- **跟随主题、中英双语** —— 跟随 DSH 浅色/深色主题，面板可在中文与 English 之间切换
- **零 npm 依赖** —— 只用 Node 内置模块；图片与历史只存本机

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

## 访问控制

`/image-studio` 路由挂在宿主 web server 上，每个请求都先过 `ctx.connection.requestRejection()`：需要浏览器凭证时返回 `401`，不是已认证的浏览器会话时返回 `403`；宿主没有提供这项检查时插件一律拒绝。因此这些路由无法被普通网页直接调用，插件要求 DSH `>= 0.2.2-rc.1`（首个提供该 API 的版本）。

## 前置条件

1. 本机装了 Codex CLI，并且已经用 ChatGPT 账号登录：`codex login status` 显示 `Logged in using ChatGPT`。
2. 能连通 `chatgpt.com`。需要代理时插件会自动探测常见的本地代理端口（7890/7897/1087/…），也可以在面板设置里手动指定。

## 结构

```
package.json          # dsh.bundle.patch + dsh.client.platform = web
cordis.patch.yml      # 插入 image-studio 一行
lib/index.js          # Host：webServer prefix 路由 + 两个工具
lib/client.js         # Client：侧栏图标 + 主面板（React，无 JSX）
lib/net.js            # 代理感知 HTTPS（CONNECT 隧道 + 手写 HTTP/1.1）
lib/codex.js          # Codex app-server JSON-RPC 额度 + 生图请求
lib/providers.js      # provider 注册表（codex 已实现，其余预留）
lib/store.js          # 设置、图片索引、PNG/JPEG/WEBP 尺寸嗅探
lib/paths.js          # $DSH_HOME / $CODEX_HOME 路径
locale/{zh,en}.json   # 插件管理里显示的标题、描述与详情文档
docs/DETAIL.zh.md     # 中文详情页（英文见 DETAIL.md）
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
