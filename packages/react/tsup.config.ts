import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/client.ts',
    'src/index.ts',
    'src/render.ts',
    'src/streaming.ts',
    'src/co-agent.ts',
    'src/dev.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'zod'],
});
