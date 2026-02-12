import { Hono } from "hono"
import { usersRoute } from "./routes/usersRoute"

export const createApp = () => {
  const app = new Hono()

  app.get("/", (c) => c.text("ok"))

  app.route("", usersRoute())

  return app
}