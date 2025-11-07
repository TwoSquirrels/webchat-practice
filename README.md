# webchat-practice

WebSocket によるチャットサービスの練習用

## 技術スタック

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Hono + TypeScript
- **Database**: SQLite (Prisma)
- **Auth**: JWT + Mock Google OAuth
- **WebSocket**: @hono/node-ws
- **Package Manager**: pnpm workspaces

## プロジェクト構成

```
.
├── packages/
│   ├── frontend/    # Next.js SSG フロントエンド
│   └── backend/     # Hono バックエンド API
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## セットアップ

### 必要な環境

- Node.js (v18 以上推奨)
- pnpm

### インストール

```bash
# pnpm をグローバルにインストール (まだの場合)
npm install -g pnpm

# 依存関係をインストール
pnpm install

# 環境変数ファイルをコピー（初回のみ）
cp packages/backend/.env.example packages/backend/.env

# Prisma マイグレーションを実行（初回のみ）
cd packages/backend
pnpm prisma migrate dev
cd ../..
```

## 開発

### すべてのパッケージを起動

```bash
pnpm run dev
```

### フロントエンドのみを起動

```bash
pnpm run dev:frontend
```

フロントエンドは http://localhost:3000 で起動します。

### バックエンドのみを起動

```bash
pnpm run dev:backend
```

バックエンドは http://localhost:3001 で起動します。

## ビルド

### すべてのパッケージをビルド

```bash
pnpm run build
```

### フロントエンドのみをビルド

```bash
pnpm run build:frontend
```

ビルド済みの静的ファイルは `packages/frontend/out/` に出力されます。

### バックエンドのみをビルド

```bash
pnpm run build:backend
```

ビルド済みの JavaScript ファイルは `packages/backend/dist/` に出力されます。

## 機能

### 認証システム

- **モック Google OAuth 認証**: 実際の Google API を使用せず、モックサーバーで OAuth フローを再現
- **テストユーザー**: 3 人のテストユーザーが用意されており、ログイン時に選択可能
- **JWT トークン**: セッション管理に JWT を使用（有効期限 7 日間）
- **SQLite データベース**: ユーザー情報を SQLite データベースに保存
- **シームレスなログイン**: アカウント作成とログインが同じ操作で完了

### チャット機能

- **WebSocket リアルタイムチャット**: 認証済みユーザー間でリアルタイムメッセージング
- **ユーザー識別**: メッセージに送信者の名前とタイムスタンプを表示
- **認証保護**: WebSocket 接続は JWT トークンで認証

## 使い方

1. **アプリケーションを起動**

   ```bash
   pnpm run dev
   ```

2. **ログイン**
   - ブラウザで http://localhost:3000 にアクセス
   - 「ログインする」ボタンをクリック
   - テストユーザーを選択（例: テストユーザー1）

3. **チャット**
   - 自動的にチャットページにリダイレクトされます
   - メッセージ入力欄にテキストを入力して「送信」をクリック
   - 複数のブラウザウィンドウで異なるユーザーでログインして、リアルタイムチャットをテスト可能

4. **ログアウト**
   - 右上の「ログアウト」ボタンをクリック

## データベース

このプロジェクトは **Prisma** を使用して SQLite データベースを管理しています。

### データベースファイル

- データベースファイルは `packages/backend/prisma/chat.db` に作成されます
- マイグレーションファイルは `packages/backend/prisma/migrations/` に保存されます

### Prisma コマンド

```bash
cd packages/backend

# Prisma Client を生成
pnpm run prisma:generate

# マイグレーションを作成・適用
pnpm run prisma:migrate

# Prisma Studio でデータベースを確認
pnpm run prisma:studio
```

### スキーマ

```prisma
model User {
  id            String   @id
  googleId      String   @unique @map("google_id")
  email         String
  name          String?
  picture       String?
  createdAt     DateTime @default(now()) @map("created_at")
  lastLoginAt   DateTime @default(now()) @map("last_login_at")

  @@index([googleId])
  @@map("users")
}
```

## 今後の予定

- ~~WebSocket によるリアルタイムチャット機能の実装~~ ✅
- ~~アカウントシステムの実装~~ ✅
- チャットルーム機能
- メッセージ履歴の永続化
