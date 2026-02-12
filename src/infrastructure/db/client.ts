import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

export const sqlite = new Database("dev.sqlite")
export const db = drizzle(sqlite)