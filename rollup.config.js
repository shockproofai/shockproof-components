import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

export default [
  // Main library build
  {
    input: 'src/index.ts',
    output: [
      {
        file: './dist/index.js',
        format: 'cjs',
        sourcemap: true,
        banner: '"use client";',
      },
      {
        file: './dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
        banner: '"use client";',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types',
        outDir: './dist',
      }),
      postcss({
        extract: 'styles.css',
        minimize: true,
      }),
    ],
    external: [
      'react', 
      'react-dom', 
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'firebase/storage'
    ],
    onwarn(warning, warn) {
      // Suppress "use client" directive warnings
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
  },
  
  // Auth standalone build
  {
    input: 'src/Auth/index.ts',
    output: [
      {
        file: 'dist/Auth/index.js',
        format: 'cjs',
        sourcemap: true,
        banner: '"use client";',
      },
      {
        file: 'dist/Auth/index.esm.js',
        format: 'esm',
        sourcemap: true,
        banner: '"use client";',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/Auth',
        rootDir: './src/Auth',
      }),
    ],
    external: [
      'react', 
      'react-dom', 
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions'
    ],
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
  },
  
  // Chatbot standalone build
  {
    input: 'src/Chatbot.tsx',
    output: [
      {
        file: 'dist/Chatbot/index.js',
        format: 'cjs',
        sourcemap: true,
        banner: '"use client";',
      },
      {
        file: 'dist/Chatbot/index.esm.js',
        format: 'esm',
        sourcemap: true,
        banner: '"use client";',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/Chatbot',
        rootDir: './src',
      }),
    ],
    external: [
      'react', 
      'react-dom', 
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions'
    ],
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
  },
  
  // AIChatbot standalone build (optional)
  {
    input: 'src/AIChatbot/index.ts',
    output: [
      {
        file: 'dist/AIChatbot/index.js',
        format: 'cjs',
        sourcemap: true,
        banner: '"use client";',
      },
      {
        file: 'dist/AIChatbot/index.esm.js',
        format: 'esm',
        sourcemap: true,
        banner: '"use client";',
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/AIChatbot/types',
        outDir: './dist/AIChatbot',
      }),
    ],
    external: [
      'react', 
      'react-dom', 
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions'
    ],
    onwarn(warning, warn) {
      // Suppress "use client" directive warnings
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
  },
  
  // Type definitions
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
  {
    input: 'dist/AIChatbot/types/index.d.ts',
    output: [{ file: 'dist/AIChatbot/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];