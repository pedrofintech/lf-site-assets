import { defineConfig } from 'vite'
import fs from 'node:fs'

const keyPath = '.cert/localhost-key.pem'
const certPath = '.cert/localhost.pem'
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)

// Em prod, o bundle é servido do Vercel mas carregado por uma página noutro
// domínio (Webflow). Usar `base` absoluto faz com que os chunks dinâmicos
// resolvam contra o Vercel em vez do domínio da página.
const PROD_BASE = 'https://educacao-financeira-lf.vercel.app/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PROD_BASE : '/',
  server: {
    host: 'localhost',
    port: 3000,
    cors: true,
    ...(hasCerts && {
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      hmr: { host: 'localhost', protocol: 'wss' },
    }),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: 'src/main.js',
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: (chunkInfo) => {
          const facade = chunkInfo.facadeModuleId
          if (facade) {
            const pageMatch = facade.match(/\/pages\/([^/]+)\/index\.js$/)
            if (pageMatch) return `assets/page-${pageMatch[1]}-[hash].js`
          }
          return 'assets/[name]-[hash].js'
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}))
