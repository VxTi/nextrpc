import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/bundle.js',
    sourcemap: true,
    minify: true,
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1));
