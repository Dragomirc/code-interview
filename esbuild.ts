import esbuild from 'esbuild'

// some of our npm dependencies use __dirname which is not globally
// available in ESM modules. We add the snippet below to each file
// to ensure __dirname continues to be defined.
const esmCompatibility = `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname as directoryName } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = directoryName(__filename);
`

const entryFile = process.argv[2]
const outputFile = process.argv[3]

esbuild.build({
  entryPoints: [entryFile],
  tsconfig: 'tsconfig.build.json',
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  platform: 'node',
  outdir: outputFile,
  outExtension: {
    '.js': '.mjs',
  },
  banner: {
    js: esmCompatibility,
  },
})
