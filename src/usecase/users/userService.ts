import type { UserRepository } from "@/domain/users/userRepository"
import type { UserId } from "@/domain/users/user"

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  list() {
    return this.repo.findAll()
  }

  get(id: UserId) {
    return this.repo.findById(id)
  }

  create(input: { name: string; email: string }) {
    return this.repo.create(input)
  }

  update(id: UserId, input: { name?: string; email?: string; isActive?: boolean }) {
    return this.repo.update(id, input)
  }

  remove(id: UserId) {
    return this.repo.delete(id)
  }
}