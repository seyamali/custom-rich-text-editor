# Copilot Instructions for My Universal Editor

## Project Overview
- **My Universal Editor** is a modular rich text editor built with [Lexical](https://lexical.dev/) and TypeScript, using Vite for bundling.
- The architecture is plugin-driven: core logic lives in `src/core/`, while features are implemented as plugins in `src/plugins/`.
- The UI and theming are managed via vanilla CSS in `src/style.css` and related files.

## Key Directories & Files
- `src/core/`: Editor engine, command registry, SDK integration.
- `src/plugins/`: Feature modules, organized by domain (e.g., `essentials/`, `formatting/`, `layout/`, `media/`).
- `src/main.ts`: Application entry point; initializes the editor and loads plugins.
- `public/`: Static assets and HTML entry point.
- `docs/`: Feature documentation and quickstart guides.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (Vite-powered hot reload)
- **Build Production:** `npm run build`
- **Install Dependencies:** `npm install`
- **Add Plugin:** Place new plugin in `src/plugins/[domain]/`, export main entry, and register in `src/core/registry.ts`.

## Patterns & Conventions
- **Plugin Registration:** All plugins must be registered in `src/core/registry.ts` for activation.
- **Node Definitions:** Custom editor nodes (e.g., images, code blocks) are defined in `src/plugins/[domain]/*-node.ts`.
- **UI Components:** Shared UI logic/components live in `src/shared/ui/`.
- **Feature Docs:** Each advanced feature has a corresponding markdown doc in `docs/` (e.g., `CODE_BLOCKS.md`).
- **TypeScript Only:** All source code is TypeScript; avoid JS in `src/`.
- **No Frameworks:** UI is vanilla JS/TS and CSS—no React, Vue, etc.

## Integration Points
- **Lexical:** Editor engine, node definitions, and commands are Lexical-based.
- **External Plugins:** Integrate by following the plugin pattern and updating the registry.
- **Asset Handling:** Images and uploads managed via plugins in `src/plugins/media/` and `src/plugins/upload/`.

## Examples
- To add a new formatting feature, create `src/plugins/formatting/my-feature.ts` and register it.
- For a new node type, implement `*-node.ts` in the relevant domain and update the registry.

## References
- See `README.md` for setup and structure.
- See `docs/` for feature-specific guides and advanced usage.

---

**If any section is unclear or missing, please provide feedback for improvement.**
