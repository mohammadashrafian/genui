import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/client.ts',
    'src/index.ts',
    'src/stream.ts',
    'src/wire-format.ts',
    'src/action.ts',
    'src/security.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['zod'],
});
