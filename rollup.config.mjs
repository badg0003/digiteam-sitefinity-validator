import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'AccessibilityValidator.ts',
  output: [
    {
      file: 'dist/accessibility-validator.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/accessibility-validator.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/accessibility-validator.umd.js',
      format: 'umd',
      name: 'AccessibilityValidator',
      sourcemap: true,
      globals: {
        'axe-core': 'axe'
      }
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
