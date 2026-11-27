# Template Studio

Draw images with the **Codex (ChatGPT subscription)** quota you already pay for, with a hand-drawn template library that lets you follow a recipe instead of writing prompts. It does four things:

1. **Reads the account quota** — plan, weekly usage, reset time and available reset credits, all from the Codex CLI interface on this machine. No extra sign-in, no API key.
2. **Template library with one-tap follow** — 594 upstream assets plus 60 ready-made recipes. Layout, style, palette, tone and ratio come locked; write one line of theme and the composer assembles the prompt from upstream text.
3. **Turns one prompt into an image** — describe the picture in the sidebar, pick a canvas and background, and the result is saved as a PNG on this machine and shown in the panel.
4. **Keeps a history** — every render records its prompt, size, elapsed time and token usage. Copy the prompt, reveal the file in Finder, download or delete it.

## Requirements

- Codex CLI installed and signed in with a ChatGPT account (`codex login status` prints `Logged in using ChatGPT`).
- `chatgpt.com` reachable. If your network needs a proxy, the plugin auto-detects common local proxy ports; you can also choose or disable a proxy under Settings in the panel.

## Using it

Click the **Template Studio** icon in the sidebar. The rail has four entries:

- **Templates** — four levels: Recipes 60 (ready-made, start here), Layouts 170, Styles 372, Colors · Tones 52. Filter by category, search by id, name or keyword; each card offers Preview or Use. The preview layer shows the official sample, its parameters and the full prompt, with ←/→ paging, copy and export to `.md`.
- **Follow a recipe** — "Use" opens a dialog with the six parameters already filled from the recipe (each can be swapped). Write one line of theme and the prompt is composed live with a character count and full preview; "Fill into studio" writes it into the prompt box, syncs the ratio and shows an applied-template bar (clear or export).
- **Free-form picking** — the "Free-form" button on the Generate page opens an asset picker: choose a layout, a style, a palette and a tone, plus optional character/scene fusion slots. Each pick recomposes the preview; "Fill into studio" writes the result and shows a `CUSTOM-…` bar with the ids you used.
- **Filters, favourites, recents** — the library toolbar filters by source (all / favourites / recent), mode and ratio; the star on each card toggles a favourite. Favourites and recents live in localStorage and survive a reload.
- **Batch export** — "Export current filter" / "Export whole curated set" compose every entry into `$DSH_HOME/image-studio/exports/<name>-<timestamp>.md` and reveal it in Finder; each file carries front matter, per-entry id/recipe/params and an attribution line.
- **Asset sync and cache** — "Sync assets" downloads all 594 sample images in the background (3 workers, live progress); the header switches to "all cached" when done. Settings let you cap the cache size (MB, 0 = unlimited), clear it or re-download everything.
- **Local checkout** — point settings at a local handraw-style clone and images are read from disk, fully offline.
- **Reference image** — attach a photo above the prompt box (PNG / JPEG / WebP, ≤12MB) and generation goes through `images/edits` so the model repaints it in the chosen style; when the account backend refuses, the panel says so instead of failing silently.
- **AI picks** — the button in the follow dialog and the picker asks the default DSH model for the six ids only (layout/style/palette/tone/ratio/mode); the prompt body is still composed from upstream text. Without an LLM route it reports a failure and manual picking still works.
- **Generate / History / Account & settings** — the original three sections; the "template reference" strip on the Generate page lends any template's style, layout or palette at any time.

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

## Template data

- **Bundled index** — the text for 594 assets (372 styles / 170 layouts / 36 colours / 16 tones) and 60 recipes ships with the plugin: about 420 KB, 38 KB gzipped.
- **Bundled covers** — the 60 recipe covers ship with the package (about 6.5 MB), so the first screen works offline.
- **Other assets on demand** — when a non-bundled asset is browsed or used, the host fetches it from jsDelivr (falling back to raw.githubusercontent) and caches it under `$DSH_HOME/image-studio/templates/assets`; each image downloads once.
- **No rewriting** — prompts are assembled from upstream text in a fixed order (style → colour → theme → ratio → tone → whitespace → requirements → layout). The plugin only selects and orders, which is why the style does not drift.
- **Credits** — data comes from [yang0/handraw-style](https://github.com/yang0/handraw-style) (MIT with attribution requirement). The panel footer, the preview layer and every exported `.md` keep the source and author notice.

## Interface style (hand-drawn skin)

The panel is a sheet of hand-drawn paper that changes material with the DSH theme:

- **Light**: warm paper (`#fbf6ea`) with grain and a soft vignette; charcoal outlines (`#2e2823`), irregular border radii, hard shadows; cinnabar (`#cf4a32`) for emphasis and marker yellow for selection. The four quota cells are sticky notes in different tints, template cards are slightly rotated stickers with a strip of tape, and the prompt box is squared paper.
- **Dark**: dark-roast paper (`#221c16`) with coarser grain and chalk-white lines (`#f3ebdc`); the accent brightens to `#e8694f`, tape turns dark gold and cards read as dark paper.

Type follows the job: HanziPen SC for headings, Hannotate SC for body, Bradley Hand for ids and counters, Wawati SC for long prompt blocks, and a system sans-serif for small captions so they stay legible. Those handwriting faces ship with macOS; on other systems the stack falls back to a system sans-serif — layout and palette stay, the handwriting gets subtler.

The skin is one stylesheet, `lib/skin-handdrawn.css`, served by the host at `/image-studio/skin.css` and injected as a `<link>` when the panel starts. It only affects presentation; delete the injection block in `lib/client.js` (search for `SKIN_ID`) to get the plain interface back.

## How the quota is read

The plugin starts the local Codex CLI's `app-server` subprocess and calls the official JSON-RPC method `account/rateLimits/read` to fetch the plan and quota windows. It is a read-only query: it does not refresh tokens, does not spend quota, and does not modify your Codex configuration. Identity, plan and quota are cached in the panel for 60 seconds.

## Where the images live

```
$DSH_HOME/image-studio/images/<id>.png    # the generated PNG
$DSH_HOME/image-studio/index.json         # history index (prompt, size, elapsed, usage)
$DSH_HOME/image-studio/settings.json      # panel settings
$DSH_HOME/image-studio/templates/assets/  # on-demand template asset cache
```

`$DSH_HOME` defaults to `~/.dsh`. Files stay on this machine; the plugin uploads nothing and collects nothing. Only when you start a render does the prompt travel to `chatgpt.com` with the request.

## Known limitations

- **One image per request**, and the size is a *suggestion*: the backend adjusts the aspect ratio to suit the picture, so the returned dimensions win (the panel always shows the real ones).
- **Transparent background** usually maps to a higher generation tier on the backend, so it costs more time and tokens.
- Codex is the only image provider for now. Claude, WorkBuddy and Kimi appear as "coming soon" in the panel; the provider layer already has room for them.
- Renders run one at a time and usually take a dozen seconds; the panel shows the elapsed time while it works.
- Composed prompts are always Chinese; the English UI only translates the interface, not the prompt text.
- Asset images rely on the GitHub CDN by default: fully offline, thumbnails for non-bundled assets are missing, while the bundled covers and all 60 recipes still work. Sync the assets or point the plugin at a local checkout to go offline.
- **Image capability is account-side**: on this machine both `images/generations` and `images/edits` can answer HTTP 403 (Codex CLI's own `image_gen` tool hits the same 403). The panel then shows "backend rejects image generation" and reference-image runs report `image-edit-forbidden`. That is a platform/account limit the plugin does not work around.
- **AI picks need an LLM route in DSH**: without one the endpoint answers `llm-unavailable` and the UI reports a failed suggestion.

## Uninstalling

Remove the plugin from its detail page. To also drop the images and history, delete the `$DSH_HOME/image-studio` directory.
