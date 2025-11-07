import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { tokenAtom, currentUserAtom } from "@/app/chat/chatStore";

interface UseCallbackAuthReturn {
  error: string | null;
}

/**
 * OAuth コールバック認証処理 Hook
 *
 * SSG 環境ではビルド時にクエリパラメータが確定しないため、
 * useSearchParams() の呼び出しと useEffect が必須。
 * useRef で React Strict Mode の二重実行を防止。
 */
export function useCallbackAuth(): UseCallbackAuthReturn {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  const setToken = useSetAtom(tokenAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleAuth = async () => {
      if (!code) {
        setError("認証コードが見つかりません");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `認証エラー: ${response.status}`);
        }

        const data = await response.json();

        // Jotai に保存 (自動的に localStorage に永続化)
        setToken(data.token);
        setCurrentUser(data.user);

        window.location.href = "/chat";
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Authentication error:", message);
        setError(message);
      }
    };

    handleAuth();
  }, [code, setToken, setCurrentUser]);

  return { error };
}
