import { db } from "@/infrastructure/db/client"
import { users } from "@/infrastructure/db/schema"
import { eq } from "drizzle-orm"
import crypto from "node:crypto"
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
} from "@/domain/users/userRepository"
import type { User } from "@/domain/users/user"

const nowIso = () => new Date().toISOString()

const rowToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  isActive: !!row.isActive,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const rows = await db.select().from(users)
    return rows.map(rowToUser)
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = crypto.randomUUID()
    const t = nowIso()
    await db.insert(users).values({
      id,
      name: input.name,
      email: input.email,
      isActive: true,
      createdAt: t,
      updatedAt: t,
    })
    const created = await this.findById(id)
    if (!created) throw new Error("failed to create user")
    return created
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const exists = await this.findById(id)
    if (!exists) return null

    await db
      .update(users)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedAt: nowIso(),
      })
      .where(eq(users.id, id))

    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const exists = await this.findById(id)
    if (!exists) return false
    await db.delete(users).where(eq(users.id, id))
    return true
  }
}