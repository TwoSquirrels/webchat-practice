import { useCallback, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";
import {
  currentUserAtom,
  tokenAtom,
  messagesAtom,
  authenticatedAtom,
  roomJoinedAtom,
  currentRoomIdAtom,
  roomHistoryAtom,
} from "../chatStore";

interface UseChatSessionProps {
  token: string | null;
  urlRoomId: string | null;
  onError: (error: string | null) => void;
  onUrlError: (error: string | null) => void;
  onLoading: (loading: boolean) => void;
}

interface ChatSessionMethods {
  sendMessage: (text: string) => void;
  createRoom: () => Promise<void>;
  joinRoomFromUrl: (url: string) => Promise<void>;
  handleRoomSelected: (roomId: string) => void;
  handleLogout: () => void;
  copyRoomUrl: () => Promise<void>;
}

export function useChatSession({
  token,
  urlRoomId,
  onError,
  onUrlError,
  onLoading,
}: UseChatSessionProps): ChatSessionMethods {
  const router = useRouter();
  const processingUrlRoomRef = useRef(!!urlRoomId);
  const roomHistoryFetchedRef = useRef(false);

  const setCurrentUser = useSetAtom(currentUserAtom);
  const setToken = useSetAtom(tokenAtom);
  const setMessages = useSetAtom(messagesAtom);
  const setAuthenticated = useSetAtom(authenticatedAtom);
  const setRoomJoined = useSetAtom(roomJoinedAtom);
  const setCurrentRoomId = useSetAtom(currentRoomIdAtom);
  const setRoomHistory = useSetAtom(roomHistoryAtom);

  const currentUser = useAtomValue(currentUserAtom);
  const authenticated = useAtomValue(authenticatedAtom);
  const currentRoomId = useAtomValue(currentRoomIdAtom);

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

            if (!roomHistoryFetchedRef.current) {
              roomHistoryFetchedRef.current = true;
              fetchRoomHistory();
            }

            if (urlRoomId && processingUrlRoomRef.current) {
              processingUrlRoomRef.current = false;
              processUrlRoom();
            } else if (currentRoomId && readyState === WebSocket.OPEN) {
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
          console.error("WebSocket message parse error:", error);
        }
      },
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
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

  const processUrlRoom = useCallback(async () => {
    if (!urlRoomId || !token) return;
    onLoading(true);
    onUrlError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/api/rooms/${urlRoomId}/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        if (response.status === 404) {
          onUrlError("指定されたルームは存在しません");
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
          },
        );
        if (!joinResponse.ok) throw new Error("ルームへの参加に失敗しました");
      }

      setCurrentRoomId(urlRoomId);
      setMessages([]);
      setRoomJoined(false);
      if (readyState === WebSocket.OPEN) {
        sendJsonMessage({ type: "join_room", roomId: urlRoomId });
      }
      await fetchRoomHistory();
    } catch (err) {
      onUrlError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      onLoading(false);
    }
  }, [
    urlRoomId,
    token,
    readyState,
    sendJsonMessage,
    setCurrentRoomId,
    setMessages,
    setRoomJoined,
    onLoading,
    onUrlError,
    fetchRoomHistory,
  ]);

  const sendMessage = useCallback(
    (text: string) => {
      if (readyState === WebSocket.OPEN && authenticated && text.trim()) {
        sendJsonMessage({ type: "message", text });
      }
    },
    [readyState, authenticated, sendJsonMessage],
  );

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
    ],
  );

  const createRoom = useCallback(async () => {
    if (!token) return;
    onLoading(true);
    onError(null);
    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("ルーム作成に失敗しました");
      const data = await response.json();
      handleRoomSelected(data.room.id);
      await fetchRoomHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      onError(message);
      throw err;
    } finally {
      onLoading(false);
    }
  }, [token, handleRoomSelected, fetchRoomHistory, onLoading, onError]);

  const joinRoomFromUrl = useCallback(
    async (url: string) => {
      if (!token || !url.trim()) return;
      onLoading(true);
      onError(null);
      try {
        const parsedUrl = new URL(url);
        const roomId = parsedUrl.searchParams.get("room");
        if (!roomId) throw new Error("有効なルームURLではありません");
        const response = await fetch(
          `http://localhost:3001/api/rooms/${roomId}/join`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error("ルームへの参加に失敗しました");
        handleRoomSelected(roomId);
        await fetchRoomHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        onError(message);
        throw err;
      } finally {
        onLoading(false);
      }
    },
    [token, handleRoomSelected, fetchRoomHistory, onLoading, onError],
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setMessages([]);
    setAuthenticated(false);
    setRoomJoined(false);
    setCurrentRoomId(null);
    roomHistoryFetchedRef.current = false;
    window.location.href = "/login";
  }, [
    setToken,
    setCurrentUser,
    setMessages,
    setAuthenticated,
    setRoomJoined,
    setCurrentRoomId,
  ]);

  const copyRoomUrl = useCallback(async () => {
    if (!currentRoomId) return;
    const roomUrl = `${window.location.origin}/?room=${currentRoomId}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      onError("ルームURLをコピーしました！");
      setTimeout(() => onError(null), 2000);
    } catch {
      onError("URLのコピーに失敗しました");
      setTimeout(() => onError(null), 2000);
    }
  }, [currentRoomId, onError]);

  return {
    sendMessage,
    createRoom,
    joinRoomFromUrl,
    handleRoomSelected,
    handleLogout,
    copyRoomUrl,
  };
}
