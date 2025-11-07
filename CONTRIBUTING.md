# コントリビューションガイド

このドキュメントは、人間の開発者と AI アシスタントの両者がこのプロジェクトに貢献する際の指針です。

## 目次

- プロジェクト概要
- 開発方針
- アーキテクチャ
- 開発ワークフロー
- コード規約
- 重要な設計決定
- SSG モデルの技術的詳細

## プロジェクト概要

WebChat Practice は、WebSocket によるリアルタイムチャットサービスの学習用プロジェクトです。

主な特徴

- モック Google OAuth 認証
- WebSocket によるリアルタイム通信
- JWT トークンベースのセッション管理
- React Suspense を活用したコンポーネント設計
- useEffect の使用を最小限に抑えた実装
- SSG (Static Site Generation) ベースのデプロイメント

## 開発方針

このプロジェクトでは以下の原則に従います。

1.  Suspense を活用した設計

    Suspense を使用してローディング状態を宣言的に管理します。データ取得と UI の分離を明確にします。

2.  副作用の最小化

    useEffect の使用を最小限に制限します。OAuth コールバックや WebSocket 接続など、必要な場面のみで使用します。

3.  SSG 互換性の確保

    SSG 環境では Server Component が利用できないため、すべてのページコンポーネント（`page.tsx`）は `"use client"` ディレクティブを使用してクライアント化します。ビルド時に静的コンテンツをプリレンダリング可能にします。

4.  型安全性

    TypeScript を積極的に活用し、インターフェースを明示的に定義します。

5.  ページコンポーネントのクライアント化

    SSG 環境では、すべてのページコンポーネント（`page.tsx`）を `"use client"` ディレクティブでクライアント化します。`useSearchParams()` や動的な初期化処理をサポートするために必須です。

## アーキテクチャ

### フロントエンド構成

```
packages/frontend/src/
├── app/
│   ├── layout.tsx              # Root レイアウト (metadata 用の Server Component)
│   ├── page.tsx                # ホーム (Client Component)
│   ├── login/
│   │   └── page.tsx            # ログインページ (Client Component)
│   ├── chat/
│   │   ├── page.tsx            # Suspense ラッパー (Client Component)
│   │   ├── ChatAuthGuard.tsx   # 認証チェック (localStorage 確認)
│   │   ├── ChatContent.tsx     # チャット本体 (WebSocket)
│   │   └── LoadingFallback.tsx # ローディング UI
│   └── auth/callback/
│       ├── page.tsx            # OAuth コールバック Suspense ラッパー (Client Component)
│       └── CallbackContent.tsx # 認証処理 (useSearchParams)
└── globals.css                 # グローバルスタイル
```

### バックエンド構成

```
packages/backend/src/
├── index.ts      # メインサーバー
├── auth.ts       # JWT 生成・検証
├── db.ts         # Prisma クライアント
├── mockGoogle.ts # OAuth コード管理
└── prisma/       # データベーススキーマ
```

### 認証フロー

1. ユーザーが `/login` にアクセス
2. モックユーザーを選択して `/auth/google` にリダイレクト
3. バックエンドが認証コードを生成して `/auth/callback` にリダイレクト
4. フロントエンドが `/auth/token` にリクエスト
5. バックエンドがトークンとユーザー情報を返す
6. フロントエンドが localStorage に保存して `/chat` にリダイレクト

### チャットフロー

1. `/chat` にアクセス
2. `page.tsx` で Suspense ラッパーを表示
3. ChatAuthGuard で localStorage のトークンを確認
4. 認証済みなら ChatContent を実装
5. ChatContent で WebSocket 接続
6. 認証トークンを送信
7. メッセージ送受信開始

## 環境構築

```bash
pnpm install

cd packages/backend
pnpm prisma migrate dev
cd ../..

pnpm dev
```

## デプロイメント

このプロジェクトは SSG (Static Site Generation) で完全に対応しています。

### ビルド時の動作

```bash
pnpm build  # out/ ディレクトリに静的ファイルを生成
```

ビルド結果には以下が含まれます

- HTML ファイル (全ルートをプリレンダリング)
- CSS・JavaScript バンドル
- 画像などの静的アセット

トークン情報や WebSocket 接続はビルド時には含まれず、すべてブラウザの実行時に処理されます。

### デプロイ方法

SSG ビルト結果はどの静的ホスティングサービスにもデプロイ可能です

- **Vercel**: `out/` ディレクトリをデプロイ
- **Netlify**: `out/` ディレクトリをデプロイ
- **GitHub Pages**: `out/` ディレクトリを git にコミット
- **AWS S3 + CloudFront**: `out/` ディレクトリをアップロード
- **その他 CDN**: 静的ファイル配信に対応

### バックエンドの配置

フロントエンドとは別に、バックエンド (`packages/backend`) をデプロイします

- OAuth 認証エンドポイント
- WebSocket サーバー
- JWT トークン生成・検証

フロントエンド設定の CORS と接続先を、バックエンド URL に合わせてください。

## コード規約

### ファイル命名規則

- React コンポーネント: PascalCase (`ChatContent.tsx`)
- ユーティリティ関数: camelCase (`helper.ts`)
- ページコンポーネント: 小文字 (`app/chat/page.tsx`)

### コンポーネント構造

SSG 環境では、`useSearchParams()` や `useRouter()` などのクライアント専用 API を使用するため、すべてのページコンポーネントは `"use client"` ディレクティブを付与する必要があります。

```tsx
// page.tsx (Client Component)
"use client";

import { Suspense } from "react";
import { ClientComponent } from "./ClientComponent";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientComponent />
    </Suspense>
  );
}

// ClientComponent.tsx (Client Component)
("use client");

export default function ClientComponent() {
  // ...
}
```

**重要**: SSG ビルド時に `metadata` が必要な場合は、`layout.tsx` のみが Server Component として機能します。ページコンポーネント（`page.tsx`）はすべてクライアント化してください。

### 型定義

```tsx
interface ChatMessage {
  type: string;
  user?: string;
  text?: string;
  timestamp?: string;
}

interface ChatContentProps {
  token: string;
  initialUser: { name: string } | null;
}

export default function ChatContent({ token, initialUser }: ChatContentProps) {
  // ...
}
```

### エラーハンドリング

```tsx
try {
  const response = await fetch("/api/endpoint");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }
  return await response.json();
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("Error:", message);
  // ユーザー向けのエラー表示
}
```

### metadata の定義

SSG 環境では `metadata` を `layout.tsx` のみで定義します。

```tsx
// layout.tsx (Server Component - metadata のため必須)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebChat Practice",
  description: "A simple chat service practice with WebSocket",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

ページコンポーネント（`page.tsx`）はすべて `"use client"` ディレクティブを付与するため、`metadata` は定義できません。

## 重要な設計決定

### `useEffect` の制限

副作用を最小化し、コンポーネントのロジックをシンプルに保つために `useEffect` の使用を制限します。

必要な場合は `useEffect` を使用できます。

```tsx
"use client";

// OAuth コールバック処理
useEffect(() => {
  // 認証コードの処理
}, [code]);

// WebSocket 接続管理
useEffect(() => {
  const ws = new WebSocket("ws://...");
  return () => ws.close();
}, []);
```

### `Suspense` の活用

ローディング状態を宣言的に管理します。

```tsx
// 推奨
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>;

// 避ける
const [isLoading, setIsLoading] = useState(false);
if (isLoading) return <Loading />;
```

### ハイドレーション安全性

SSG 環境では Server Component が使用できないため、以下の点に注意してください

```tsx
// 正しい: SSG 環境では全て Client Component
"use client";
<Suspense fallback={<Loading />}>
  <ClientComponent /> {/* localStorage アクセス可 */}
</Suspense>;

// 避ける: Server/Client の混在
if (typeof window !== "undefined") {
  // SSG では Server Component そのものが存在しないため不要
}
```

### `localStorage` の使用

Client Component のみでアクセスしてください。

```tsx
// 正しい
"use client";
const token = localStorage.getItem("token");

// 間違い
// Server Component では localStorage にアクセス不可
```

## SSG モデルの技術的詳細

このプロジェクトは `next.config.js` の `output: "export"` により SSG モードで動作します。

### ルートの静的プリレンダリング

すべてのルートはビルド時にプリレンダリングされます

- `/`: Home page (静的リンクのみ)
- `/login`: ログインページ (静的 UI)
- `/chat`: チャットページ (認証チェックは Client Component で実施)
- `/auth/callback`: OAuth コールバック (クエリパラメータ処理は Client 側)

### 動的な URL パラメータの処理

`useSearchParams()` や `useRouter()` などのクエリ処理は Client Component 内に完全に封じ込めます

```tsx
// /app/auth/callback/CallbackContent.tsx
"use client";
const searchParams = useSearchParams(); // Client で実行
const code = searchParams.get("code"); // ビルド時に未定義、実行時に解決
```

### ナビゲーション

Client Component では `window.location.href` を使用してナビゲーションします。これによりページリロードが発生しますが、SSG 環境では `useRouter()` が利用不可のため、この実装が必要です。

```tsx
// 正しい (SSG 互換)
window.location.href = "/login";

// 間違い (SSG では動作未定義)
useRouter().push("/login");
```

### localStorage 情報の永続化

トークンと認証情報は `localStorage` に保存されます。これはビルド時には解決不可能な実行時の状態です

```tsx
// 認証チェック (Client Component)
"use client";
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    // 未認証状態を表示
  } else {
    // 認証済み状態を表示
  }
}, []);
```

### WebSocket 接続

WebSocket は本質的に実行時の機能であり、SSG 環境では完全に Client Component に委ねられます。ビルド時には接続されず、ブラウザで実行時に確立されます。

### ハイブリッド設計の注意点

このアーキテクチャでは、静的コンテンツ (HTML/CSS) と動的な認証情報・通信が共存します

- ビルド時: HTML/CSS/JS のみが生成される (トークン情報は含まれない)
- 実行時: Client Component が localStorage のトークンをチェックし、UI を動的に決定
- リロード時: ビルト後の静的 HTML が配信され、その後 Client Component が実行される
