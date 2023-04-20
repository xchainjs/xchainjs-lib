import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: "json" };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
			// pass custom options to the resolve plugin
			moduleDirectories: ['node_modules']
		}),
    typescript({
      tsconfig: 'tsconfig.json', // path to your tsconfig.json file
      exclude: '__tests__/**',
      include: ['*.ts'],
    }),
    commonjs(),
  ],
};
