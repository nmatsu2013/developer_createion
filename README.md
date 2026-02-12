# developer_createion
developer_createion is note


- npm run dev

- curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Taro","email":"taro@example.com"}'

- curl http://localhost:3000/users

- curl -X PATCH http://localhost:3000/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'

- curl -X DELETE http://localhost:3000/users/<id>

---

## よくある拡張ポイント（実装付き）

### 1. ユーザーの重複制約（email unique）

#### ① schema に unique 制約を追加

```ts
// schema.ts
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
  })
)
```
```
npm run db:generate
npm run db:migrate
// domain/errors.ts
export class EmailAlreadyExistsError extends Error {}

// drizzleUserRepository.ts
try {
  await db.insert(users).values({...})
} catch (e: any) {
  if (e.message?.includes("users_email_unique")) {
    throw new EmailAlreadyExistsError()
  }
  throw e
}
// interface/httpErrorMapper.ts
import { EmailAlreadyExistsError } from "@/domain/errors"

export const mapErrorToHttp = (err: unknown) => {
  if (err instanceof EmailAlreadyExistsError) {
    return { status: 409, body: { message: "email already exists" } }
  }

  return { status: 500, body: { message: "internal server error" } }
}

import { mapErrorToHttp } from "@/interface/httpErrorMapper"

create = async (c: Context) => {
  try {
    ...
  } catch (err) {
    const mapped = mapErrorToHttp(err)
    return c.json(mapped.body, mapped.status)
  }
}
→ これで ドメインはHTTPを知らないまま エラー設計できる。

10-3. DIコンテナ導入（手動DIの肥大化対策）

小規模なら手動DIでOKだが、肥大化したら：

例：シンプルDIコンテナ

// container.ts
import { DrizzleUserRepository } from "@/infrastructure/repositories/drizzleUserRepository"
import { UserService } from "@/usecase/users/userService"
import { UsersController } from "@/interface/controllers/usersController"

export const createContainer = () => {
  const repo = new DrizzleUserRepository()
  const service = new UserService(repo)
  const controller = new UsersController(service)

  return {
    usersController: controller,
  }
}
const container = createContainer()
app.get("/users", container.usersController.list)

付録：この構成の意図（超短く）

domain

ビジネスの中心
	•	フレームワーク非依存
	•	DB非依存
	•	例外設計はここ

usecase

操作の流れ
	•	「何をするか」の手順
	•	外部I/Oを知らない

interface

入出力変換層
	•	DTO
	•	Presenter
	•	HTTPエラー変換

infrastructure

外部接続の実装
	•	DB
	•	ORM
	•	外部API

presentation

フレームワーク層
	•	Hono
	•	ルーティング
	•	DI組み立て



```


