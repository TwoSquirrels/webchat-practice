"use client";

import { useCallback, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";
import {
  currentUserAtom,
  tokenAtom,
  messagesAtom,
  authenticatedAtom,
  chatInputAtom,
  currentRoomIdAtom,
  roomJoinedAtom,
  roomHistoryAtom,
} from "../chatStore";
import RoomSidebar from "./RoomSidebar";
import ChatArea from "./ChatArea";
import URLErrorScreen from "./URLErrorScreen";

interface ChatContentProps {
  token: string;
  initialUser: { name: string } | null;
  urlRoomId: string | null;
}

export default function ChatContent({
  token,
  initialUser,
  urlRoomId,
}: ChatContentProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [, setToken] = useAtom(tokenAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [authenticated, setAuthenticated] = useAtom(authenticatedAtom);
  const [roomJoined, setRoomJoined] = useAtom(roomJoinedAtom);
  const [input, setInput] = useAtom(chatInputAtom);
  const [currentRoomId, setCurrentRoomId] = useAtom(currentRoomIdAtom);
  const [roomHistory, setRoomHistory] = useAtom(roomHistoryAtom);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [processingUrlRoom, setProcessingUrlRoom] = useState(!!urlRoomId);

  const { sendJsonMessage, readyState } = useWebSocket(
    token ? "ws://localhost:3001/ws" : null,
    {
      onOpen: () => {
        if (token) {
          sendJsonMessage({ type: "auth", token });
        }
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "auth_success") {
            setAuthenticated(true);
            if (data.user?.name) {
              setCurrentUser({ name: data.user.name });
            }
            // ルーム履歴を取得
            fetchRoomHistory();
            // URL からのルーム参加を優先
            if (urlRoomId && processingUrlRoom) {
              // URL からのルーム参加を非同期で実行
              (async () => {
                setLoading(true);
                setUrlError(null);
                try {
                  const response = await fetch(
                    `http://localhost:3001/api/rooms/${urlRoomId}/status`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (!response.ok) {
                    if (response.status === 404) {
                      setUrlError("指定されたルームは存在しません");
                      setProcessingUrlRoom(false);
                      return;
                    }
                    throw new Error("ルーム情報の取得に失敗しました");
                  }
                  const statusData = await response.json();
                  if (!statusData.isJoined) {
                    const joinResponse = await fetch(
                      `http://localhost:3001/api/rooms/${urlRoomId}/join`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (!joinResponse.ok)
                      throw new Error("ルームへの参加に失敗しました");
                  }
                  setCurrentRoomId(urlRoomId);
                  setMessages([]);
                  setRoomJoined(false);
                  sendJsonMessage({ type: "join_room", roomId: urlRoomId });
                  setProcessingUrlRoom(false);
                } catch (err) {
                  setUrlError(
                    err instanceof Error ? err.message : "Unknown error"
                  );
                  setProcessingUrlRoom(false);
                } finally {
                  setLoading(false);
                }
              })();
            } else if (currentRoomId) {
              sendJsonMessage({ type: "join_room", roomId: currentRoomId });
            }
          } else if (data.type === "room_joined") {
            setRoomJoined(true);
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
            }
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data]);
          } else if (data.type === "error") {
            if (
              data.message.includes("token") ||
              data.message.includes("authenticated")
            ) {
              setToken(null);
              setCurrentUser(null);
              window.location.href = "/login";
            }
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      },
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  const fetchRoomHistory = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3001/api/rooms/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setRoomHistory(data.rooms || []);
    } catch (err) {
      console.error("Failed to fetch room history:", err);
    }
  }, [token, setRoomHistory]);

  const sendMessage = useCallback(() => {
    if (
      readyState === WebSocket.OPEN &&
      authenticated &&
      roomJoined &&
      input.trim()
    ) {
      sendJsonMessage({ type: "message", text: input });
      setInput("");
    }
  }, [readyState, authenticated, roomJoined, input, sendJsonMessage, setInput]);

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setMessages([]);
    setAuthenticated(false);
    setRoomJoined(false);
    setCurrentRoomId(null);
    window.location.href = "/login";
  };

  const handleRoomSelected = useCallback(
    (roomId: string) => {
      setCurrentRoomId(roomId);
      setMessages([]);
      setRoomJoined(false);
      router.replace(`/?room=${roomId}`);
      if (authenticated && readyState === WebSocket.OPEN) {
        sendJsonMessage({ type: "join_room", roomId });
      }
    },
    [
      setCurrentRoomId,
      setMessages,
      setRoomJoined,
      authenticated,
      readyState,
      sendJsonMessage,
      router,
    ]
  );

  const createRoom = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("ルーム作成に失敗しました");
      const data = await response.json();
      handleRoomSelected(data.room.id);
      fetchRoomHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, handleRoomSelected, fetchRoomHistory]);

  const joinRoomFromUrl = useCallback(
    async (url: string) => {
      if (!token || !url.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const parsedUrl = new URL(url);
        const roomId = parsedUrl.searchParams.get("room");
        if (!roomId) throw new Error("有効なルームURLではありません");
        const response = await fetch(
          `http://localhost:3001/api/rooms/${roomId}/join`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("ルームへの参加に失敗しました");
        handleRoomSelected(roomId);
        fetchRoomHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [token, handleRoomSelected, fetchRoomHistory]
  );

  const copyRoomUrl = useCallback(async () => {
    if (!currentRoomId) return;
    const roomUrl = `${window.location.origin}/?room=${currentRoomId}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setError("ルームURLをコピーしました！");
      setTimeout(() => setError(null), 2000);
    } catch {
      setError("URLのコピーに失敗しました");
      setTimeout(() => setError(null), 2000);
    }
  }, [currentRoomId]);

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
          onRoomSelected={handleRoomSelected}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoomFromUrl}
          onLogout={handleLogout}
          loading={loading}
          error={error}
        />
        <div className="flex-1 flex flex-col">
          <ChatArea
            currentRoomId={currentRoomId}
            currentUser={currentUser}
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSendMessage={sendMessage}
            onCopyRoomUrl={copyRoomUrl}
            authenticated={authenticated}
            roomJoined={roomJoined}
            onCreateRoom={createRoom}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}
