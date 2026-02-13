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