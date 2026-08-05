import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// LuxeWear Frontend — Vite konfiguratsiyasi
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let apiOrigin = null
  try {
    apiOrigin = new URL(env.VITE_API_URL).origin
  } catch (_) {
    apiOrigin = null
  }

  const plugins = [react()]

  // Backend domeniga ertaroq ulanish: API so'rovlari brauzer tomonidan
  // skript bajarilgandan keyingina boshlanadi (request chaining). Oldindan
  // preconnect orqali DNS+TLS isitilsa, ma'lumot yuklash tezroq boshlanadi.
  if (apiOrigin) {
    plugins.push({
      name: 'api-preconnect',
      apply: 'build',
      transformIndexHtml() {
        return [
          {
            tag: 'link',
            attrs: { rel: 'preconnect', href: apiOrigin, crossorigin: '' },
            injectTo: 'head-start',
          },
        ]
      },
    })
  }

  return {
    plugins,
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
