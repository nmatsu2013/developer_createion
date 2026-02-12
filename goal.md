# Hono + クリーンアーキテクチャで「ユーザーマスタ」を作る手順（サーバーサイド）

このMDは、**Hono** を使って **クリーンアーキテクチャ**なディレクトリ構成で、最小限の **ユーザーマスタ（CRUD）** を作るまでの手順を “一気通貫” でまとめたものです。  
（例：Node.js / TypeScript / SQLite / Drizzle ORM）

---

## 0. ゴール（完成形）

- API
  - `GET /users`（一覧）
  - `GET /users/:id`（詳細）
  - `POST /users`（作成）
  - `PATCH /users/:id`（更新）
  - `DELETE /users/:id`（削除）
- クリーンアーキテクチャ
  - `domain`（エンティティ / 値オブジェクト / リポジトリIF）
  - `usecase`（アプリケーションサービス）
  - `interface`（Controller / Presenter / DTO）
  - `infrastructure`（DB/ORM 実装）
  - `presentation`（Honoのルーティング）

---

## 1. 初期セットアップ

### 1-1. プロジェクト作成

```bash
mkdir hono-clean-user-master
cd hono-clean-user-master
npm init -y