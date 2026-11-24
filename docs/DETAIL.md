# Image Studio

Draw images with the **Codex (ChatGPT subscription)** quota you already pay for. It does three things:

1. **Reads the account quota** — plan, weekly usage, reset time and available reset credits, all from the Codex CLI interface on this machine. No extra sign-in, no API key.
2. **Turns one prompt into an image** — describe the picture in the sidebar, pick a canvas and background, and the result is saved as a PNG on this machine and shown in the panel.
3. **Keeps a history** — every render records its prompt, size, elapsed time and token usage. Copy the prompt, reveal the file in Finder, download or delete it.

## Requirements

- Codex CLI installed and signed in with a ChatGPT account (`codex login status` prints `Logged in using ChatGPT`).
- `chatgpt.com` reachable. If your network needs a proxy, the plugin auto-detects common local proxy ports; you can also choose or disable a proxy under Settings in the panel.

## Using it

Click the **Image Studio** icon in the sidebar. The panel has three sections, and the left rail jumps between them:

- **Generate** — write a prompt, pick a canvas (auto / portrait / landscape / square) and a background (opaque / transparent), then press Generate or `⌘/Ctrl + Enter`. Three sample prompts sit under the box; click one to fill it in.
- **History** — each render is a card with its prompt, dimensions, byte size and elapsed time. Hovering an image reveals three actions (reveal in Finder, download, delete); clicking it opens a full-screen viewer.
- **Account & settings** — plan, weekly quota, reset time and reset credits; in settings you can switch the proxy mode (auto / off / custom), point at a specific Codex executable, or switch the panel language (中文 / English).

If the account is not ready on first use, the panel shows a sign-in hint instead. The panel follows the DSH light/dark theme and shifts its accent colour with it.

The model can call the same two tools:

| Tool | What it does | Main parameters |
| --- | --- | --- |
| `image_studio_generate` | Generates one image and saves it | `prompt` (required), `size`, `background` |
| `image_studio_quota` | Reads the current account quota | none |

`image_studio_generate` returns the absolute path of the file plus its dimensions, byte size and elapsed time, so follow-up steps can open or reference it.

## How the quota is read

The plugin starts the local Codex CLI's `app-server` subprocess and calls the official JSON-RPC method `account/rateLimits/read` to fetch the plan and quota windows. It is a read-only query: it does not refresh tokens, does not spend quota, and does not modify your Codex configuration. Identity, plan and quota are cached in the panel for 60 seconds.

## Where the images live

```
$DSH_HOME/image-studio/images/<id>.png    # the generated PNG
$DSH_HOME/image-studio/index.json         # history index (prompt, size, elapsed, usage)
$DSH_HOME/image-studio/settings.json      # panel settings
```

`$DSH_HOME` defaults to `~/.dsh`. Files stay on this machine; the plugin uploads nothing and collects nothing. Only when you start a render does the prompt travel to `chatgpt.com` with the request.

## Known limitations

- **One image per request**, and the size is a *suggestion*: the backend adjusts the aspect ratio to suit the picture, so the returned dimensions win (the panel always shows the real ones).
- **Transparent background** usually maps to a higher generation tier on the backend, so it costs more time and tokens.
- Codex is the only image provider for now. Claude, WorkBuddy and Kimi appear as "coming soon" in the panel; the provider layer already has room for them.
- Renders run one at a time and usually take a dozen seconds; the panel shows the elapsed time while it works.

## Uninstalling

Remove the plugin from its detail page. To also drop the images and history, delete the `$DSH_HOME/image-studio` directory.
