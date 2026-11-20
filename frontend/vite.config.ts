import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { requireUserFromAuthHeader } from './api/_lib/requireUser'

const TT_BASE = 'https://api.tickettailor.com/v1'

function ticketTailorApiPlugin(env: Record<string, string>): Plugin {
  const apiKey = env.TICKET_TAILOR_API_KEY
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

  return {
    name: 'tickettailor-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tickettailor/events')) {
          next()
          return
        }

        const auth = await requireUserFromAuthHeader(
          req.headers.authorization,
          supabaseUrl,
          supabaseAnonKey,
        )
        if (!auth.ok) {
          res.statusCode = auth.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: auth.error }))
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
          const ttAuth = Buffer.from(`${apiKey}:`).toString('base64')
          const headers = {
            Accept: 'application/json',
            Authorization: `Basic ${ttAuth}`,
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
      ticketTailorApiPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
