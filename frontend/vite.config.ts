import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const TT_BASE = 'https://api.tickettailor.com/v1'

function ticketTailorApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'tickettailor-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tickettailor/events')) {
          next()
          return
        }

        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'TICKET_TAILOR_API_KEY ontbreekt in .env',
            }),
          )
          return
        }

        try {
          const auth = Buffer.from(`${apiKey}:`).toString('base64')
          const headers = {
            Accept: 'application/json',
            Authorization: `Basic ${auth}`,
          }

          const all: unknown[] = []
          let url: string | null = `${TT_BASE}/events?limit=100`

          while (url) {
            const ttRes = await fetch(url, { headers })
            if (!ttRes.ok) {
              const body = await ttRes.text()
              res.statusCode = ttRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: body }))
              return
            }
            const json = (await ttRes.json()) as {
              data?: unknown[]
              links?: { next?: string | null }
            }
            all.push(...(json.data ?? []))
            url = json.links?.next || null
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ data: all }))
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'TicketTailor proxy failed',
            }),
          )
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      ticketTailorApiPlugin(env.TICKET_TAILOR_API_KEY),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
