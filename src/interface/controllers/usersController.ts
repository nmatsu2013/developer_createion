import type { Context } from "hono"
import { createUserSchema, updateUserSchema } from "@/interface/dto/usersDto"
import { presentUser, presentUsers } from "@/interface/presenters/usersPresenter"
import type { UserService } from "@/usecase/users/userService"

export class UsersController {
  constructor(private readonly service: UserService) {}

  list = async (c: Context) => {
    const users = await this.service.list()
    return c.json({ users: presentUsers(users) })
  }

  get = async (c: Context) => {
    const id = c.req.param("id")
    const user = await this.service.get(id)
    if (!user) return c.json({ message: "not found" }, 404)
    return c.json({ user: presentUser(user) })
  }

  create = async (c: Context) => {
    const body = await c.req.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) return c.json({ message: "validation error", issues: parsed.error.issues }, 400)

    const user = await this.service.create(parsed.data)
    return c.json({ user: presentUser(user) }, 201)
  }

  update = async (c: Context) => {
    const id = c.req.param("id")
    const body = await c.req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) return c.json({ message: "validation error", issues: parsed.error.issues }, 400)

    const user = await this.service.update(id, parsed.data)
    if (!user) return c.json({ message: "not found" }, 404)
    return c.json({ user: presentUser(user) })
  }

  remove = async (c: Context) => {
    const id = c.req.param("id")
    const ok = await this.service.remove(id)
    if (!ok) return c.json({ message: "not found" }, 404)
    return c.json({ ok: true })
  }
}