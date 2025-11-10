"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { User } from "../types";
import {
  currentUserAtom,
  messagesAtom,
  authenticatedAtom,
  chatInputAtom,
  currentRoomIdAtom,
  roomJoinedAtom,
  roomHistoryAtom,
} from "../chatStore";
import { useChatSession } from "../hooks/useChatSession";
import RoomSidebar from "./RoomSidebar";
import ChatArea from "./ChatArea";
import URLErrorScreen from "./URLErrorScreen";

interface ChatContentProps {
  token: string;
  initialUser: User | null;
  urlRoomId: string | null;
}

export default function ChatContent({
  token,
  initialUser,
  urlRoomId,
}: ChatContentProps) {
  const currentUser = useAtomValue(currentUserAtom);
  const messages = useAtomValue(messagesAtom);
  const authenticated = useAtomValue(authenticatedAtom);
  const roomJoined = useAtomValue(roomJoinedAtom);
  const input = useAtomValue(chatInputAtom);
  const currentRoomId = useAtomValue(currentRoomIdAtom);
  const roomHistory = useAtomValue(roomHistoryAtom);
  const setChatInput = useSetAtom(chatInputAtom);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const session = useChatSession({
    token,
    urlRoomId,
    onError: setError,
    onUrlError: setUrlError,
    onLoading: setLoading,
  });

  const handleSendMessage = () => {
    if (input.trim()) {
      session.sendMessage(input);
      setChatInput("");
    }
  };

  if (urlError) {
    return (
      <URLErrorScreen error={urlError} onDismiss={() => setUrlError(null)} />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto h-screen flex">
        <RoomSidebar
          currentUser={currentUser}
          roomHistory={roomHistory}
          currentRoomId={currentRoomId}
          onRoomSelected={session.handleRoomSelected}
          onCreateRoom={session.createRoom}
          onJoinRoom={session.joinRoomFromUrl}
          onLogout={session.handleLogout}
          loading={loading}
          error={error}
        />
        <div className="flex-1 flex flex-col">
          <ChatArea
            currentRoomId={currentRoomId}
            currentUser={currentUser}
            messages={messages}
            input={input}
            onInputChange={setChatInput}
            onSendMessage={handleSendMessage}
            onCopyRoomUrl={session.copyRoomUrl}
            authenticated={authenticated}
            roomJoined={roomJoined}
            onCreateRoom={session.createRoom}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}
