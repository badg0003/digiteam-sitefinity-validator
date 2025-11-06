import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'AccessibilityValidator.ts',
  output: [
    {
      file: 'dist/accessibility-validator.cjs.js',
      format: 'cjs',
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/accessibility-validator.esm.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/accessibility-validator.umd.js',
      format: 'umd',
      name: 'AccessibilityValidator',
      sourcemap: true,
      globals: {
        'axe-core': 'axe'
      },
      plugins: [terser()],
    }
  ],
  external: [], // Bundle axe-core with the library
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
};
