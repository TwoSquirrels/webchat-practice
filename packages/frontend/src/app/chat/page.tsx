"use client";

import { Suspense } from "react";
import { ChatAuthGuard } from "./ChatAuthGuard";
import { ChatLoadingFallback } from "./LoadingFallback";

/**
 * チャットページ
 * 認証ガードで保護され、未認証時はログインページへのリンクを表示
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatAuthGuard />
    </Suspense>
  );
}
