import type { User } from "@/domain/users/user"

export const presentUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  isActive: u.isActive,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
})

export const presentUsers = (users: User[]) => users.map(presentUser)