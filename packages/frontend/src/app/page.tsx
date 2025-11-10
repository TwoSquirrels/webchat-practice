"use client";

import { Suspense } from "react";
import { ChatAuthGuard } from "./components/ChatAuthGuard";
import { ChatLoadingFallback } from "./components/LoadingFallback";

export default function Home() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatAuthGuard />
    </Suspense>
  );
}
