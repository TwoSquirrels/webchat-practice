interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  authenticated: boolean;
  roomJoined: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSendMessage,
  authenticated,
  roomJoined,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!authenticated || !roomJoined}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          placeholder={
            !authenticated
              ? "認証中..."
              : !roomJoined
                ? "ルームに参加中..."
                : "メッセージを入力..."
          }
        />
        <button
          onClick={onSendMessage}
          disabled={!authenticated || !roomJoined || !input.trim()}
          className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          送信
        </button>
      </div>
    </div>
  );
}
