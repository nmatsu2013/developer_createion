import type { Config } from "drizzle-kit"

export default {
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "dev.sqlite",
  },
} satisfies Config