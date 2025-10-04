import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    banner: {
      js: '#!/usr/bin/env node'
    }
  },
  {
    entry: ['src/setup.ts'],
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
]);
