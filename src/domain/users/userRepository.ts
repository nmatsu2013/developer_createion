import type { User, UserId } from "./user"

export type CreateUserInput = {
  name: string
  email: string
}

export type UpdateUserInput = {
  name?: string
  email?: string
  isActive?: boolean
}

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: UserId): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
  update(id: UserId, input: UpdateUserInput): Promise<User | null>
  delete(id: UserId): Promise<boolean>
}