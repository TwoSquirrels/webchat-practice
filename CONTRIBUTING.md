# コントリビューションガイド

WebChat Practice は WebSocket によるリアルタイムチャットサービスの学習用プロジェクトです。このドキュメントでは、プロジェクトの設計原則とコード規約をまとめています。

## 開発方針

このプロジェクトは以下の原則に従います。

1. **Suspense を活用した設計** - ローディング状態を宣言的に管理
2. **副作用の最小化** - useEffect は必要な場面 (OAuth コールバック、WebSocket 接続) のみで使用
3. **SSG 互換性の確保** - すべてのページコンポーネント (`page.tsx`) を `"use client"` ディレクティブでクライアント化
4. **型安全性** - TypeScript を活用し、インターフェースを明示的に定義

## アーキテクチャ

フロントエンド側では `packages/frontend/src/` 下に以下の構成を維持します。

```
app/
├── layout.tsx              # Root レイアウト (Server Component)
├── page.tsx                # ホーム (Client Component)
├── login/page.tsx          # ログインページ (Client Component)
├── chat/
│   ├── page.tsx            # Suspense ラッパー (Client Component)
│   ├── ChatAuthGuard.tsx   # 認証チェック
│   ├── ChatContent.tsx     # チャット本体 (WebSocket)
│   ├── chatStore.ts        # Jotai ストア
│   └── LoadingFallback.tsx # ローディング UI
└── auth/callback/
    ├── page.tsx            # OAuth コールバック (Client Component)
    └── useCallbackAuth.ts  # OAuth 認証ロジック Hook
```

バックエンド側は `packages/backend/src/` で OAuth・WebSocket・JWT を管理します。

認証フローは以下の通りです。

1. ユーザーが `/login` にアクセス
2. モックユーザーを選択して `/auth/google` にリダイレクト
3. バックエンドが認証コードを生成して `/auth/callback` にリダイレクト
4. フロントエンドが `/auth/token` にリクエスト
5. バックエンドがトークンとユーザー情報を返す
6. フロントエンドが localStorage に保存して `/chat` にリダイレクト

## 環境構築

```bash
pnpm install
cd packages/backend
pnpm prisma migrate dev
cd ../..
pnpm dev
```

## コード規約

### ファイル命名規則

- React コンポーネント: PascalCase (`ChatContent.tsx`)
- ユーティリティ関数: camelCase (`helper.ts`)
- ページコンポーネント: 小文字 (`app/chat/page.tsx`)

### コメント戦略

書くべきコメント: 非自明な設計判断や複雑なロジック、セキュリティやパフォーマンスの配慮、API エンドポイント・Hook の使用方法、SSG 環境での制約や工夫

書かないコメント: 関数名が既に意図を表現している場合、型定義や制御フローが自明な場合、変数名が意図を明確に示している場合

例えば、`const user = data.user;` といった自明なコメントは不要ですが、「SSG 環境では useEffect は必須、useRef で二重実行を防止 (React Strict Mode 対策)」といった理由と背景を説明するコメントは書くべきです。

### コンポーネント構造

SSG 環境では、`useSearchParams()` や `useRouter()` などのクライアント専用 API を使用するため、すべてのページコンポーネント (`page.tsx`) は `"use client"` ディレクティブを付与してください。

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }
  return await response.json();
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("Error:", message);
  setError(message);
}
```

## 重要な設計決定

### Jotai による localStorage 管理

`localStorage` の管理は **Jotai** の `atomWithStorage` を使用します。これにより、手動での `localStorage.getItem()` / `setItem()` が不要になり、React の状態管理として統一されます。

```tsx
import { atomWithStorage } from "jotai/utils";

// localStorage に自動保存される Atom
export const tokenAtom = atomWithStorage<string | null>("token", null);
export const currentUserAtom = atomWithStorage<User | null>("user", null);
```

### `useEffect` の制限

副作用を最小化し、コンポーネントのロジックをシンプルに保つために `useEffect` の使用を制限します。必要な場面 (OAuth コールバック、WebSocket 接続など) のみで使用してください。

SSG 環境では `useSearchParams()` の結果がビルド時に確定しないため、OAuth コールバック処理では `useEffect` が必須です。`useRef` で二重実行を防止 (React Strict Mode 対策) してください。

```tsx
import { useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";

export function useCallbackAuth() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    // 認証処理を実行
  }, [code]);
}
```

### `Suspense` の活用

ローディング状態を宣言的に管理します。

```tsx
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

### `localStorage` の使用

Client Component のみでアクセスしてください。ハイドレーション対策として `window` 存在チェックを実施してください。
