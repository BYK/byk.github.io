<!-- This section is maintained by the coding agent via lore (https://github.com/BYK/opencode-lore) -->
## Long-term Knowledge

### Architecture

<!-- lore:019d90af-55da-74d2-8c71-bcf75f386348 -->
* **byk.github.io blog: Astro v5 static site on GitHub Pages**: Personal blog at byk.im built with Astro v6.1.6, deployed as static SSG to GitHub Pages via \`withastro/action@v3\` on \`master\` branch. Uses pnpm (10.28.0, pinned via \`packageManager\` field in package.json) with Volta for Node version management (Node 24.13.0 in \`volta\` block, but CI pins \`node-version: 22\` since the action defaults to Node 20). Content collections use Content Layer API with \`glob()\` loaders in \`src/content.config.ts\`. Three collections: \`posts\` (MDX), \`author\` (JSON), \`page\` (unused). Posts use custom \`slug\` data field for routing (\`entry.data.slug\`, not \`entry.id\`). Key integrations: \`@astrojs/mdx\` v5, \`@astrojs/rss\` v4, \`@tailwindcss/vite\` v4, \`astro-icon\`, \`sharp\`. Tailwind v4 config in \`src/css/style.css\` via \`@theme\` block. Custom remark plugin injects word count. RSS uses \`AstroContainer\` to render full MDX.

### Gotcha

<!-- lore:019d90b6-18c7-704a-909a-313417822ef7 -->
* **Astro v6 AstroContainer still requires experimental\_ prefix**: In Astro v6.1.6, \`astro/container\` only exports \`experimental\_AstroContainer\`, not \`AstroContainer\`. The non-prefixed name does not exist despite v6 being a major release. Import as: \`import { experimental\_AstroContainer as AstroContainer } from "astro/container"\`. This tripped up the migration because the upgrade guide implied the experimental prefix would be dropped.

<!-- lore:019d90b6-18cf-7f00-bc50-9634ccee482c -->
* **Astro v6 requires sharp as explicit dependency**: Astro v6 needs \`sharp\` explicitly installed for image optimization during \`astro build\`. It was previously a transitive dependency but is no longer automatically available. Run \`pnpm add sharp\` if the build fails with \`MissingSharp\` error. The \`pnpm approve-builds\` step may be needed for sharp's native bindings.

<!-- lore:019d9102-eb2b-789c-9bd3-ad7fe7a6765e -->
* **withastro/action@v3 requires packageManager field and explicit node-version**: \`withastro/action@v3\` uses \`pnpm/action-setup@v4\` which fails with "No pnpm version is specified" unless \`package.json\` has a \`"packageManager": "pnpm@X.Y.Z"\` field. Volta's node pin is ignored in CI. The action also defaults to Node 20, but Astro v6 requires Node 22+. Fix: add \`"packageManager": "pnpm@10.28.0"\` to package.json AND pass \`node-version: 22\` to \`withastro/action@v3\` in the workflow.
<!-- End lore-managed section -->
