# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Requires Node v22 via nvm (system default is v12)
source $NVM_DIR/nvm.sh && nvm use 22

npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (strict mode)
```

## Architecture

This is a **3D interactive portfolio** where a full-screen anime bedroom is the primary UI. Users click on furniture/objects to navigate sections; the camera animates to face that object and an overlay panel slides in with content.

**State flow:**
- `App.tsx` — holds `activeSection: SectionId | null` state, renders `<Scene3D>` plus `<ContentPanel>` conditionally
- `Scene3D.tsx` — R3F `<Canvas>` with ACESFilmic tone mapping and Bloom post-processing; composes all room sub-components
- `src/components/room/` — all Three.js/R3F scene components
- `src/components/ui/ContentPanel.tsx` — Framer Motion overlay panel (About / Skills / Projects / Contact)

**Navigation mapping (3D object → section):**
- Monitor → About
- Keyboard → Skills
- Wall Posters → Projects
- Sakura Tree → Contact

**Camera states** are defined as named positions in `CameraController.tsx`. When adding or renaming sections, update both `App.tsx` `SectionId` type and the `STATES` object in `CameraController`.

## Key Technical Constraints

**`@react-three/postprocessing` SSR stub** — Three.js r165+ removed `WebGLMultipleRenderTargets`, which the postprocessing package still imports. `vite.config.ts` contains custom Rollup/esbuild plugins that stub out `screen-space-reflections.js` to avoid the runtime error. Do not remove or simplify this without verifying postprocessing compatibility.

**CSS import ordering** — In `index.css`, `@import url(...)` font imports must appear before `@tailwind` directives (PostCSS ordering requirement).

**Node version** — The project requires Node v22 via nvm. The system default is Node 12, so always activate nvm before running npm commands.

## Libraries

| Purpose | Package |
|---|---|
| 3D rendering | `@react-three/fiber` + `three` |
| 3D helpers | `@react-three/drei` (Sparkles, camera) |
| Post-processing | `@react-three/postprocessing` (Bloom only) |
| Animation | `framer-motion` |
| Icons | `lucide-react` |
| Styling | Tailwind CSS + custom CSS vars (`index.css`) |
| Backend (contact form) | `@supabase/supabase-js` |
