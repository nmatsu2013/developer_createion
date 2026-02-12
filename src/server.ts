import { serve } from "@hono/node-server"
import { createApp } from "@/presentation/http/app"

const app = createApp()

serve(
  { fetch: app.fetch, port: 3000 },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`)
  }
)