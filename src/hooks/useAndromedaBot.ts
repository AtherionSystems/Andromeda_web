// src/hooks/useAndromedaBot.ts
import { useCallback } from "react";
import { apiFetch } from "../api/client";

interface AiChatResponse {
  reply: string;
  model: string;
  latencyMs: number;
}

/**
 * Drop-in replacement for TelegramBotWidget's onSendMessage prop.
 * Calls POST /api/ai/chat and returns the AI reply string.
 *
 * Falls back gracefully:
 *   - AI disabled  → shows the backend's message
 *   - 503          → "AI backend unreachable."
 *   - Network err  → re-throws so TelegramBotWidget marks the message as error
 */
export function useAndromedaBot() {
  const sendMessage = useCallback(async (message: string): Promise<string> => {
    const data = await apiFetch<AiChatResponse>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return data.reply;
  }, []);

  return { sendMessage };
}
