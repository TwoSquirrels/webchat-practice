# webchat-practice

WebSocket によるチャットサービスの練習用

## 技術スタック

- **Frontend**: Next.js (SSG) + TypeScript + Tailwind CSS
- **Backend**: Hono + TypeScript
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

## 今後の予定

- WebSocket によるリアルタイムチャット機能の実装

