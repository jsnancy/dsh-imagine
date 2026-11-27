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
