# webchat-practice

WebSocket によるチャットサービスの練習用

## 技術スタック

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Hono + TypeScript
- **Database**: SQLite (better-sqlite3)
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

# better-sqlite3 のビルドスクリプトを承認
pnpm approve-builds
# (スペースキーで better-sqlite3 を選択し、Enter を押し、y を入力して承認)
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

SQLite データベースファイル (`chat.db`) はバックエンドのルートディレクトリに作成されます。

### スキーマ

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## 今後の予定

- ~~WebSocket によるリアルタイムチャット機能の実装~~ ✅
- ~~アカウントシステムの実装~~ ✅
- チャットルーム機能
- メッセージ履歴の永続化
