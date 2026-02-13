# DDD寄り：User エンティティ強化版（Hono + Clean Architecture 前提）

この章は「ユーザーマスタ」を **DDD寄り**にして、`domain` を強くする（= ルールを domain に寄せる）ための差分です。
- **Entity / Value Object / Domain Service / Domain Event / Repository IF** を追加
- usecase は「手順」に徹して domain を呼ぶ
- infrastructure は永続化だけ

---

## 1. 目標（DDD寄りにすると何が変わる？）

### Before（弱いdomain）
- `User` はただの型
- バリデーションはDTO（HTTP側）中心
- ルールが散らばる

### After（強いdomain）
- `User` は **生成・変更のルール**を持つ（不変条件/整合性）
- `Email` / `UserName` などを **Value Object化**
- 「email重複」などは **Domain Service** で表現
- 必要なら **Domain Event** も切れる

---

## 2. ディレクトリ（domain強化）

```txt
src/domain/
  shared/
    errors.ts
    entity.ts
    valueObject.ts
    domainEvent.ts

  users/
    userId.ts
    email.ts
    userName.ts
    user.ts
    userRepository.ts
    userDomainService.ts
    events/
      userCreated.ts

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends DomainError {}
export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}

export abstract class Entity<Id> {
  constructor(public readonly id: Id) {}
}

export abstract class ValueObject<T> {
  protected constructor(public readonly value: T) {}

  equals(other: ValueObject<T>) {
    return this.value === other.value
  }
}
export type DomainEvent = {
  readonly name: string
  readonly occurredAt: string
}
import { ValueObject } from "@/domain/shared/valueObject"
import { ValidationError } from "@/domain/shared/errors"

export class UserId extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static of(value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValidationError("UserId is required")
    }
    return new UserId(value)
  }
}
import { ValueObject } from "@/domain/shared/valueObject"
import { ValidationError } from "@/domain/shared/errors"

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static of(value: string) {
    const v = value?.trim() ?? ""
    // ざっくり。厳密にやるなら専用ライブラリやRFC準拠を別途。
    if (!v.includes("@") || v.startsWith("@") || v.endsWith("@")) {
      throw new ValidationError("Invalid email")
    }
    return new Email(v.toLowerCase())
  }
}
import { ValueObject } from "@/domain/shared/valueObject"
import { ValidationError } from "@/domain/shared/errors"

export class UserName extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static of(value: string) {
    const v = value?.trim() ?? ""
    if (v.length < 1) throw new ValidationError("Name is required")
    if (v.length > 50) throw new ValidationError("Name must be <= 50 chars")
    return new UserName(v)
  }
}
import { Entity } from "@/domain/shared/entity"
import { ValidationError } from "@/domain/shared/errors"
import { UserId } from "./userId"
import { Email } from "./email"
import { UserName } from "./userName"
import type { DomainEvent } from "@/domain/shared/domainEvent"
import { UserCreated } from "./events/userCreated"

export type UserProps = {
  name: UserName
  email: Email
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export class User extends Entity<UserId> {
  private domainEvents: DomainEvent[] = []

  private constructor(id: UserId, private props: UserProps) {
    super(id)
    this.ensureValid()
  }

  static create(params: { id: UserId; name: UserName; email: Email; nowIso: string }) {
    const user = new User(params.id, {
      name: params.name,
      email: params.email,
      isActive: true,
      createdAt: params.nowIso,
      updatedAt: params.nowIso,
    })

    user.domainEvents.push(UserCreated.of({ userId: user.id.value, occurredAt: params.nowIso }))
    return user
  }

  static rehydrate(params: { id: UserId } & UserProps) {
    // DBから復元する用（イベントは発生させない）
    return new User(params.id, {
      name: params.name,
      email: params.email,
      isActive: params.isActive,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    })
  }

  // --- getters（外にはプリミティブorVOで返す運用） ---
  get name() { return this.props.name }
  get email() { return this.props.email }
  get isActive() { return this.props.isActive }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  // --- behavior ---
  changeName(name: UserName, nowIso: string) {
    this.props.name = name
    this.touch(nowIso)
  }

  changeEmail(email: Email, nowIso: string) {
    this.props.email = email
    this.touch(nowIso)
  }

  deactivate(nowIso: string) {
    if (!this.props.isActive) return
    this.props.isActive = false
    this.touch(nowIso)
  }

  activate(nowIso: string) {
    if (this.props.isActive) return
    this.props.isActive = true
    this.touch(nowIso)
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents = []
    return events
  }

  private touch(nowIso: string) {
    this.props.updatedAt = nowIso
    this.ensureValid()
  }

  private ensureValid() {
    // 例：退会済みユーザーはメール変更不可、などの不変条件があればここに書く
    if (!this.props.createdAt) throw new ValidationError("createdAt is required")
    if (!this.props.updatedAt) throw new ValidationError("updatedAt is required")
  }
}

import type { DomainEvent } from "@/domain/shared/domainEvent"

export class UserCreated implements DomainEvent {
  readonly name = "UserCreated" as const
  readonly occurredAt: string
  readonly userId: string

  private constructor(params: { userId: string; occurredAt: string }) {
    this.userId = params.userId
    this.occurredAt = params.occurredAt
  }

  static of(params: { userId: string; occurredAt: string }) {
    return new UserCreated(params)
  }
}

import type { User } from "./user"
import type { UserId } from "./userId"
import type { Email } from "./email"

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>          // create/updateを統合（aggregate保存）
  delete(id: UserId): Promise<boolean>
}

import type { User } from "./user"
import type { UserId } from "./userId"
import type { Email } from "./email"

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>          // create/updateを統合（aggregate保存）
  delete(id: UserId): Promise<boolean>
}

import type { User } from "@/domain/users/user"

export const presentUser = (u: User) => ({
  id: u.id.value,
  name: u.name.value,
  email: u.email.value,
  isActive: u.isActive,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
})

import { DomainError, ValidationError, NotFoundError, ConflictError } from "@/domain/shared/errors"

export const mapDomainError = (e: unknown) => {
  if (e instanceof ValidationError) return { status: 400, body: { message: e.message } }
  if (e instanceof NotFoundError) return { status: 404, body: { message: e.message } }
  if (e instanceof ConflictError) return { status: 409, body: { message: e.message } }
  if (e instanceof DomainError) return { status: 400, body: { message: e.message } }
  return { status: 500, body: { message: "internal server error" } }
}

12. どこからDDDを強めるか（判断基準）

DDD寄りにする優先度はこの順が現実的：
	1.	Value Object 化（Email/UserName）：最も効く。バグ減る。
	2.	Entity の振る舞い（changeEmail/deactivate 等）：ルールを集約。
	3.	Domain Service：複数Entity/Repo横断ルール（重複チェックなど）。
	4.	Domain Event：監査ログ・通知・非同期処理が必要になったら。

