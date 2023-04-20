import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import external from '@types/rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: false,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: false,
    },
  ],
  plugins: [
    json({}),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      // Remove or update options here
      exclude: '__tests__/**',
    }),
    commonjs(),
  ],
  external: ['readable-stream', 'buffer', 'crypto', 'stream', 'string_decoder', 'axios'],
}
