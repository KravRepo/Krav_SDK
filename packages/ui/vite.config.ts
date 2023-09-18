import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import typescript from '@rollup/plugin-typescript'

// https://vitejs.dev/config/
const resolvePath = (str: string) => resolve(__dirname, str)
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [react()],
    base: env.VITE_BASE_URL,
    define: {
      // By default, Vite doesn't include shims for NodeJS/
      // necessary for segment analytics lib to work
      // global: 'window',
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    optimizeDeps: {},
    // esbuild: { drop: ['console', 'debugger'] },
    build: {
      // sourcemap:true
      lib: {
        formats: ['es'],
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'lib',
        fileName: (format) => `index.${format}.js`,
      },
      minify: 'esbuild',
      outDir: 'lib',
      rollupOptions: {
        input: {
          lib: resolvePath('src/index.ts'),
        },
        plugins: [
          typescript({
            tsconfig: './tsconfig.json',
          }),
        ],
        external: [
          'ahooks',
          'antd',
          'react',
          'react-dom',
          'react-router-dom',
          'styled-components',
          'moment',
          'bignumber.js',
          /^@web3-react/,
        ],
        output: {
          globals: {},
        },
      },
    },
    server: {
      port: 3007,
    },
  })
}
