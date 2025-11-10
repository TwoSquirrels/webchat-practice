# コントリビューションガイド

WebChat Practice は WebSocket でリアルタイムチャットを実現するプロジェクトです。ここでは、コードを書く際に大事なルールをまとめています。

## 基本的な考え方

このプロジェクトでは以下を大切にしています：

1. **Suspense でローディングを管理** - ローディング状態を自然に扱う
2. **useEffect は最小限に** - 外部システムとの連携が必要なときだけ使う（OAuth、WebSocket など）
3. **SSG 対応** - ページコンポーネント（`page.tsx`）には必ず `"use client"` を付ける
4. **TypeScript で型安全に** - 型を明示的に定義して、バグを減らす

## セットアップ

```bash
pnpm install
cd packages/backend
pnpm prisma migrate dev
cd ../..
pnpm dev
```

開発サーバーが起動したら、`http://localhost:3000` にアクセスしてください。

## ファイル構成

### フロントエンド

`packages/frontend/src/app/` は以下の構成になっています：

```
app/
├── layout.tsx              # ルートレイアウト
├── page.tsx                # ホームページ
├── login/
│   ├── page.tsx            # ログインページ
│   └── LoginContent.tsx    # ログイン処理
├── auth/callback/
│   ├── page.tsx            # OAuth コールバック
│   └── useCallbackAuth.ts  # トークン取得ロジック
├── components/             # 再利用できるコンポーネント
├── hooks/
│   └── useChatSession.ts   # 統合 Hook
├── types/
│   └── index.ts            # 型定義の集約
└── chatStore.ts            # Jotai の状態管理
```

### バックエンド

`packages/backend/src/` は以下の構成になっています：

```
src/
├── index.ts                # ルーター設定
├── routes/
│   ├── auth.ts             # OAuth・認証処理
│   ├── rooms.ts            # ルーム管理
│   └── websocket.ts        # WebSocket 通信
├── middleware/
│   └── auth.ts             # 認証チェック
├── types/
│   └── index.ts            # WebSocket メッセージ型
├── db.ts                   # データベース接続
├── auth.ts                 # JWT 処理
└── mockGoogle.ts           # モック OAuth サーバー
```

## 認証フロー

1. ユーザーが `/login` にアクセス
2. モックユーザーを選んでボタンを押す
3. `/auth/google` にリダイレクト
4. バックエンドが認証コードを生成して `/auth/callback` にリダイレクト
5. フロントエンドが `/auth/token` にリクエスト
6. バックエンドがトークンとユーザー情報を返す
7. フロントエンドが localStorage に保存して `/chat` へ移動

## コード規約

### ファイル名

- React コンポーネント: PascalCase （`ChatContent.tsx`）
- 関数やユーティリティ: camelCase （`helper.ts`）
- ページ: 小文字 （`page.tsx`）

### 型定義

型は `app/types/index.ts` に集約します。

```tsx
export interface User {
  name: string;
  id?: string;
  email?: string;
}

export interface Room {
  id: string;
  lastAccessAt: string;
}

export interface ChatMessage {
  type: string;
  user?: string;
  text?: string;
  timestamp?: string;
}
```

コンポーネントで使う際：

```tsx
import type { User, ChatMessage } from "../types";

interface Props {
  currentUser: User | null;
  messages: ChatMessage[];
}

export default function ChatContent({ currentUser, messages }: Props) {
  // ...
}
```

### エラー処理

```tsx
try {
  const response = await fetch("/api/endpoint");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(message);
  setError(message);
}
```

## 設計パターン

### WebSocket メッセージは Union 型で型安全にする

WebSocket のメッセージは Union 型を使います。これでコンパイル時に無効なメッセージ型を検出できます。

```tsx
// types/index.ts - Backend
export type IncomingMessage =
  | { type: "auth"; token: string }
  | { type: "join_room"; roomId: string }
  | { type: "message"; text: string };

export type OutgoingMessageType =
  | { type: "auth_success"; user: { name: string } }
  | { type: "room_joined"; roomId: string; messages: ChatMessage[] }
  | { type: "message"; user: string; text: string; timestamp: string }
  | { type: "error"; message: string };

function parseMessage(data: unknown): IncomingMessage | null {
  try {
    const msg = JSON.parse(String(data));
    if (msg.type === "auth" && typeof msg.token === "string") return msg;
    if (msg.type === "join_room" && typeof msg.roomId === "string") return msg;
    if (msg.type === "message" && typeof msg.text === "string") return msg;
  } catch (e) {
    console.error("Failed to parse message:", e);
  }
  return null;
}
```

フロントエンドでも型を使ってメッセージを処理：

```tsx
const handleMessage = (message: OutgoingMessageType) => {
  switch (message.type) {
    case "auth_success":
      setCurrentUser(message.user);
      break;
    case "message":
      addMessage(message);
      break;
    case "error":
      setError(message.message);
      break;
  }
};
```

### 認証チェックはミドルウェアでまとめる

バックエンドで認証チェックが何度も出てくるなら、ミドルウェアに統一します。

```tsx
// middleware/auth.ts
export async function verifyAuthMiddleware(
  c: Context,
  next: () => Promise<void>,
) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("authPayload", payload);
  await next();
}

export function getAuthPayload(c: Context) {
  return c.get("authPayload");
}
```

ルートで使う時：

```tsx
// Bad: 毎回認証チェック
router.post("/api/rooms", async (c) => {
  const token = c.req.header("Authorization")?.substring(7);
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  // route processing...
});

// Good: ミドルウェアに任せる
router.post("/api/rooms", verifyAuthMiddleware, async (c) => {
  const payload = getAuthPayload(c);
  // route processing...
});
```

### Jotai で localStorage を管理する

`localStorage` は Jotai の `atomWithStorage` で管理します。`getItem()` / `setItem()` を直接使わない。

```tsx
import { atomWithStorage } from "jotai/utils";

export const tokenAtom = atomWithStorage<string | null>("token", null);
export const currentUserAtom = atomWithStorage<User | null>("user", null);
```

## useEffect と Suspense

### useEffect は最小限に

`useEffect` は外部システムとの連携が必要な時だけ使います。理由は、コードが読みやすくなり、実行速度も向上し、バグも減るから。

**useEffect が不要なケース**

データ変換やボタンクリック処理はイベントハンドラから直接行う。

```tsx
// Bad: useEffect でフィルタリング
function UserList({ users, searchQuery }) {
  const [filtered, setFiltered] = useState([]);
  useEffect(() => {
    setFiltered(users.filter((u) => u.name.includes(searchQuery)));
  }, [users, searchQuery]);
  return (
    <ul>
      {filtered.map((u) => (
        <li>{u.name}</li>
      ))}
    </ul>
  );
}

// Good: 直接レンダー内でフィルタリング
function UserList({ users, searchQuery }) {
  const filtered = users.filter((u) => u.name.includes(searchQuery));
  return (
    <ul>
      {filtered.map((u) => (
        <li>{u.name}</li>
      ))}
    </ul>
  );
}
```

**useEffect が必要な場合**

URL パラメータの変化や WebSocket 接続など、状態に応じて自動的に副作用を実行する必要がある場合に使う。

SSG 環境では `useSearchParams()` がビルド時に確定しないため、OAuth コールバック処理は `useEffect` で実装。`useRef` で二重実行を防ぐ。

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

    const handleAuth = async () => {
      if (!code) return;
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    };
    handleAuth();
  }, [code]);
}
```

通常の API 呼び出しはイベントハンドラから直接呼び出します。

```tsx
// ログインボタンクリック時に直接 API を呼び出す
async function handleLogin(userId: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Login failed");
    const data = await response.json();
    setAtom(tokenAtom, data.token);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  }
}
```

**useEffect を使う前に**

1. 本当に状態の変化に応じた自動実行が必要か？
2. ユーザーイベントとして処理できないか？
3. 依存配列は正しいか？

### Suspense でローディングを管理

SSG 環境では Browser API を使うコンポーネントを Suspense で包む。

```tsx
// page.tsx
"use client";
import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginContent />
    </Suspense>
  );
}

// LoginContent.tsx
("use client");
import { useSearchParams } from "next/navigation";

export default function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  // ...
}
```
