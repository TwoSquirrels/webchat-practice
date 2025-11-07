# WebChat Practice

WebSocket によるリアルタイムチャットサービスの学習用プロジェクトです。

モック Google OAuth 認証、WebSocket によるリアルタイム通信、JWT トークンベースのセッション管理を実装しており、SSG (Static Site Generation) で完全に対応したフロントエンドと、Hono + TypeScript のバックエンドで構成されています。

## 技術スタック

- **Frontend**: Next.js (SSG) + TypeScript + Tailwind CSS + React Suspense
- **Backend**: Hono + TypeScript + WebSocket
- **Database**: SQLite + Prisma ORM
- **Authentication**: JWT + Mock Google OAuth
- **WebSocket**: @hono/node-ws
- **Package Manager**: pnpm workspaces

## プロジェクト構成

```
.
├── packages/
│   ├── frontend/    # Next.js SSG フロントエンド
│   └── backend/     # Hono WebSocket バックエンド
├── CONTRIBUTING.md  # 開発ガイド
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 開発について

このプロジェクトの開発原則、アーキテクチャ、コード規約については **[CONTRIBUTING.md](./CONTRIBUTING.md)** をご覧ください。

特に以下の内容が記載されています：

- **開発方針**: Suspense の活用、副作用の最小化、SSG 互換性
- **アーキテクチャ**: フロントエンド・バックエンドの構成図
- **コード規約**: ファイル命名規則、コンポーネント構造、型定義
- **重要な設計決定**: SSG 環境での実装上の注意点
- **認証フロー・チャットフロー**: 詳細な処理フロー

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

フロントエンドは http://localhost:3000 、バックエンドは http://localhost:3001 で起動します。

### フロントエンドのみを起動

```bash
pnpm run dev:frontend
```

### バックエンドのみを起動

```bash
pnpm run dev:backend
```

## ビルド

### すべてのパッケージをビルド

```bash
pnpm run build
```

### フロントエンドをビルド（SSG）

```bash
pnpm run build:frontend
```

静的ファイルは `packages/frontend/out/` に出力されます。SSG により完全な静的サイトとして生成され、Vercel、Netlify、GitHub Pages など、任意の静的ホスティングサービスにデプロイ可能です。

### バックエンドをビルド

```bash
pnpm run build:backend
```

JavaScript ファイルは `packages/backend/dist/` に出力されます。

## 機能

### 認証システム

- **モック Google OAuth**: 実際の Google API を使用せず、モックサーバーで OAuth フローを再現
- **テストユーザー**: 3 人のテストユーザーが用意されており、ログイン時に選択可能
- **JWT トークン**: セッション管理に JWT を使用（有効期限 7 日間）
- **SQLite データベース**: ユーザー情報を Prisma を通じて管理
- **シームレスなログイン**: アカウント作成とログインが同じ操作で完了

### チャット機能

- **WebSocket リアルタイムチャット**: 認証済みユーザー間でリアルタイムメッセージング
- **ユーザー識別**: メッセージに送信者の名前とタイムスタンプを付与
- **認証保護**: WebSocket 接続は JWT トークンで認証

### フロントエンド

- **SSG (Static Site Generation)**: 完全な静的サイトとしてビルド
- **React Suspense**: ローディング状態を宣言的に管理
- **クライアント専用 API**: `useSearchParams()` などはすべて Client Component に封じ込め
- **localStorage**: JWT トークンをブラウザに安全に保存

## 使い方

1. **アプリケーションを起動**

   ```bash
   pnpm run dev
   ```

2. **ログイン**
   - ブラウザで http://localhost:3000 にアクセス
   - 「ログインする」ボタンをクリック
   - テストユーザーを選択 (例: テストユーザー1)

3. **チャット開始**
   - 自動的にチャットページにリダイレクトされます
   - メッセージ入力欄にテキストを入力して「送信」をクリック

4. **複数ユーザーでテスト**
   - 別のブラウザウィンドウで異なるユーザーでログイン
   - リアルタイムチャットをテスト可能

5. **ログアウト**
   - チャットページの「ログアウト」ボタンをクリック

## データベース

このプロジェクトは **Prisma** を使用して SQLite データベースを管理しています。

### データベースファイル

- データベースファイル: `packages/backend/prisma/chat.db`
- マイグレーション: `packages/backend/prisma/migrations/`

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

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下でライセンスされています。

## コントリビューション

プロジェクトへのコントリビューション方法については、**[CONTRIBUTING.md](./CONTRIBUTING.md)** をご参照ください。
