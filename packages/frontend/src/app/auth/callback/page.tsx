"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import CallbackContent from "./CallbackContent";

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="z-10 max-w-2xl w-full items-center justify-center font-mono text-sm">
            <h1 className="text-2xl font-bold text-center mb-4">
              読み込み中...
            </h1>
          </div>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
