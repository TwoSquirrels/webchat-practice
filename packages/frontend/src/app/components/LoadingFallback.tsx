export function ChatLoadingFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          WebChat Practice
        </h1>
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    </main>
  );
}
