import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Several @react-three/postprocessing v2 effects (SSR, N8AO) import
// WebGLMultipleRenderTargets which was removed in Three.js r165+.
// These stubs make both the Rollup (prod) and esbuild (dev pre-bundle) happy.

const BROKEN_PATTERNS = /screen-space-reflections|N8AOPostPass/;
const STUB = 'export default {}; export function SSREffect(){}; export function N8AOPostPass(){};';

// Rollup plugin — covers `vite build`
function stubBrokenEffects(): Plugin {
  return {
    name: 'stub-broken-postprocessing-effects',
    load(id) {
      if (BROKEN_PATTERNS.test(id)) return STUB;
    },
  };
}

// GitHub Pages serves a project site from /<repo>/ but a user site
// (<name>.github.io) from the root. GITHUB_REPOSITORY is set by Actions, so the
// right base is worked out at build time and stays '/' for local dev.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const base = repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/';

export default defineConfig({
  base,
  plugins: [react(), stubBrokenEffects()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      // esbuild plugin — covers `vite dev` pre-bundling
      plugins: [
        {
          name: 'stub-broken-postprocessing-effects-esbuild',
          setup(build: { onLoad: Function }) {
            build.onLoad({ filter: BROKEN_PATTERNS }, () => ({
              contents: STUB,
              loader: 'js',
            }));
          },
        },
      ],
    },
  },
});
