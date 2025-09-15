import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    sourcemap: false,
    minify: true,
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1));
