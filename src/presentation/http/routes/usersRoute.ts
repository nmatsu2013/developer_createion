import { Hono } from "hono"
import { UsersController } from "@/interface/controllers/usersController"
import { UserService } from "@/usecase/users/userService"
import { DrizzleUserRepository } from "@/infrastructure/repositories/drizzleUserRepository"

export const usersRoute = () => {
  const app = new Hono()

  // DI（最小構成：手動）
  const repo = new DrizzleUserRepository()
  const service = new UserService(repo)
  const controller = new UsersController(service)

  app.get("/users", controller.list)
  app.get("/users/:id", controller.get)
  app.post("/users", controller.create)
  app.patch("/users/:id", controller.update)
  app.delete("/users/:id", controller.remove)

  return app
}