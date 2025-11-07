import { redirect } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export async function AuthGuard({ children }: AuthGuardProps) {
  // サーバーサイドで認証チェック
  // 実際にはサーバーサイドアクションやクッキーから取得
  return <>{children}</>;
}

export async function getAuthData() {
  // クライアントサイドで必要なデータをサーバーで取得する場合の例
  // 実装時は、cookies や headers から認証情報を取得
  return null;
}
