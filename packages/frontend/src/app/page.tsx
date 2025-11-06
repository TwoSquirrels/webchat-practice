export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          WebChat Practice
        </h1>
        <p className="text-center text-lg mb-4">
          WebSocketによるチャットサービスの練習用
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">技術スタック</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Frontend: Next.js (SSG) + TypeScript + Tailwind CSS</li>
            <li>Backend: Hono + TypeScript</li>
            <li>Package Manager: pnpm workspaces</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
