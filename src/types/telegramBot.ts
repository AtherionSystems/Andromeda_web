// src/types/telegramBot.ts
import type { ReactNode } from "react";

export interface BotMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface TelegramBotWidgetProps {
  /** Any ReactNode rendered inside the square floating button */
  buttonIcon?: ReactNode;
  /** Accessible aria-label for the button */
  buttonLabel?: string;
  /** Display name in the modal header */
  botName?: string;
  /** Subtitle below the bot name */
  botSubtitle?: string;
  /** Optional avatar URL — falls back to a letter avatar */
  botAvatarUrl?: string;
  /** Bot username WITHOUT @ — used to build the Telegram deep-link */
  telegramUsername: string;
  /**
   * Async function called on every send.
   * Receives the user's raw text, must return the bot reply string.
   * Falls back to a built-in demo echo handler when omitted.
   */
  onSendMessage?: (message: string) => Promise<string>;
}
