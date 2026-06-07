// TelegramBotWidget.tsx
// Adapted to Andromeda's design system:
//   - useTheme() hook with darkMode boolean (not Tailwind dark: classes)
//   - Accent color: #C74634 (Oracle red)
//   - Consistent with InputField.tsx and Button.tsx patterns

import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../../contexts/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface TelegramBotWidgetProps {
  /** Icon element rendered inside the square floating button */
  buttonIcon?: ReactNode;
  /** Accessible label for the floating button */
  buttonLabel?: string;
  /** Bot display name in the modal header */
  botName?: string;
  /** Subtitle below the bot name */
  botSubtitle?: string;
  /** Optional avatar URL; falls back to letter avatar */
  botAvatarUrl?: string;
  /** Telegram bot username (without @) for the deep-link */
  telegramUsername: string;
  /**
   * Called on each send. Must return the bot's reply string.
   * Defaults to a built-in demo handler if omitted.
   */
  onSendMessage?: (message: string) => Promise<string>;
}

// ─── Demo handler (replace with useAndromedaBot in production) ────────────────

const demoHandler = async (message: string): Promise<string> => {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
  const l = message.toLowerCase();
  if (l.includes("project") || l.includes("proyecto"))
    return "📁 Found 4 active projects. Use /projects to see the full list, or ask me about a specific one.";
  if (l.includes("task") || l.includes("tarea"))
    return "✅ You have 12 open tasks across 3 sprints. Would you like me to filter by project?";
  if (l.includes("sprint"))
    return "🏃 Sprint 7 is active (ends in 4 days). Health score: 8/10.";
  if (l.includes("analiz") || l.includes("analyz") || l.includes("health"))
    return "📊 Project 3 health: 7/10. Top risk: 2 overdue tasks in the backend module.";
  return `🤖 Processing: "${message}". Try asking about projects, tasks, or sprints — in English or Spanish.`;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingDots({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Bot avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: "#C74634" }}
      >
        A
      </div>
      {/* Bubble */}
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"
        style={{
          backgroundColor: darkMode ? "#1e293b" : "#ffffff",
          border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <span className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: darkMode ? "#64748b" : "#94a3b8",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function BotBubble({ msg, darkMode }: { msg: Message; darkMode: boolean }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: "#C74634" }}
      >
        A
      </div>
      <div className="max-w-[78%]">
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm"
          style={{
            backgroundColor: darkMode ? "#1e293b" : "#ffffff",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            color: darkMode ? "#f1f5f9" : "#1e293b",
          }}
        >
          {msg.text}
        </div>
        <p
          className="text-[10px] mt-1 ml-1"
          style={{ color: darkMode ? "#475569" : "#94a3b8" }}
        >
          {fmt(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ msg, darkMode }: { msg: Message; darkMode: boolean }) {
  const isError = msg.status === "error";
  return (
    <div className="flex items-end justify-end gap-2 mb-3">
      <div className="max-w-[78%]">
        <div
          className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm"
          style={
            isError
              ? {
                  backgroundColor: darkMode ? "rgba(185,28,28,0.2)" : "#fef2f2",
                  border: `1px solid ${darkMode ? "#7f1d1d" : "#fca5a5"}`,
                  color: darkMode ? "#fca5a5" : "#b91c1c",
                }
              : {
                  backgroundColor: "#C74634",
                  color: "#ffffff",
                }
          }
        >
          {msg.text}
        </div>
        <p
          className="text-[10px] mt-1 text-right mr-1"
          style={{ color: darkMode ? "#475569" : "#94a3b8" }}
        >
          {msg.status === "sending" && "Sending…"}
          {msg.status === "error" && "⚠ Error — try again"}
          {msg.status === "sent" && fmt(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TelegramBotWidget({
  buttonIcon,
  buttonLabel = "Open Andromeda AI Bot",
  botName = "Andromeda AI",
  botSubtitle = "Natural language · Project assistant",
  botAvatarUrl,
  telegramUsername,
  onSendMessage,
}: TelegramBotWidgetProps) {
  const { darkMode } = useTheme();

  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "bot",
      text: "👋 Hola! I'm the Andromeda AI assistant. Ask me anything about your projects, tasks, or sprints — in English or Spanish.",
      timestamp: new Date(),
      status: "sent",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hoveringBtn, setHoveringBtn] = useState(false);
  const [hoveringSend, setHoveringSend] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handler = onSendMessage ?? demoHandler;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 180);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      text,
      timestamp: new Date(),
      status: "sending",
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const reply = await handler(text);
      setMessages((p) =>
        p
          .map((m) =>
            m.id === userMsg.id ? { ...m, status: "sent" as const } : m,
          )
          .concat({
            id: uid(),
            role: "bot",
            text: reply,
            timestamp: new Date(),
            status: "sent",
          }),
      );
    } catch {
      setMessages((p) =>
        p.map((m) =>
          m.id === userMsg.id ? { ...m, status: "error" as const } : m,
        ),
      );
    } finally {
      setTyping(false);
    }
  }, [input, typing, handler]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived colors from darkMode ──────────────────────────────────────────
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const surface = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const textMain = darkMode ? "#f1f5f9" : "#1e293b";
  const textMuted = darkMode ? "#94a3b8" : "#64748b";
  const inputBg = darkMode ? "#0f172a" : "#f1f5f9";
  const accent = "#C74634";

  const chips = ["List projects", "Show sprints", "Analyze project 1"];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHoveringBtn(true)}
        onMouseLeave={() => setHoveringBtn(false)}
        aria-label={buttonLabel}
        style={{
          position: "fixed",
          bottom: "4rem",
          right: "1.5rem",
          zIndex: 50,
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "0.75rem",
          backgroundColor: hoveringBtn ? "#a83929" : accent,
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: hoveringBtn
            ? "0 8px 24px rgba(199,70,52,0.45)"
            : "0 4px 16px rgba(199,70,52,0.35)",
          transform: hoveringBtn ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.18s ease",
          outline: "none",
        }}
      >
        {buttonIcon ?? <DefaultBotIcon />}
      </button>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            opacity: isClosing ? 0 : 1,
            transition: "opacity 0.18s ease",
          }}
        />
      )}

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label={`${botName} chat`}
          style={{
            position: "fixed",
            bottom: "8.5rem",
            right: "1.5rem",
            zIndex: 51,
            width: "360px",
            maxHeight: "540px",
            display: "flex",
            flexDirection: "column",
            borderRadius: "1rem",
            overflow: "hidden",
            backgroundColor: bg,
            border: `1px solid ${border}`,
            boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
            transformOrigin: "bottom right",
            transform: isClosing ? "scale(0.95)" : "scale(1)",
            opacity: isClosing ? 0 : 1,
            transition: "transform 0.18s ease, opacity 0.18s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              backgroundColor: surface,
              borderBottom: `1px solid ${border}`,
              flexShrink: 0,
            }}
          >
            {botAvatarUrl ? (
              <img
                src={botAvatarUrl}
                alt={botName}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                A
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: textMain,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {botName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {botSubtitle}
              </p>
            </div>

            {/* Open in Telegram */}
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in Telegram"
              title="Open in Telegram"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                color: textMuted,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = darkMode
                  ? "#0f172a"
                  : "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <TelegramIcon size={16} />
            </a>

            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Close chat"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                backgroundColor: "transparent",
                color: textMuted,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = darkMode
                  ? "#0f172a"
                  : "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <XIcon size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              minHeight: 0,
            }}
          >
            {messages.map((msg) =>
              msg.role === "bot" ? (
                <BotBubble key={msg.id} msg={msg} darkMode={darkMode} />
              ) : (
                <UserBubble key={msg.id} msg={msg} darkMode={darkMode} />
              ),
            )}
            {typing && <TypingDots darkMode={darkMode} />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              overflowX: "auto",
              flexShrink: 0,
              borderTop: `1px solid ${border}`,
              scrollbarWidth: "none",
            }}
          >
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setInput(chip);
                  inputRef.current?.focus();
                }}
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  padding: "0.3rem 0.75rem",
                  borderRadius: 999,
                  border: `1px solid ${border}`,
                  backgroundColor: surface,
                  color: textMuted,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.color = accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.color = textMuted;
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: surface,
              borderTop: `1px solid ${border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… or type a /command"
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  color: textMain,
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: "none",
                  maxHeight: "7rem",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing}
                onMouseEnter={() => setHoveringSend(true)}
                onMouseLeave={() => setHoveringSend(false)}
                aria-label="Send message"
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor:
                    !input.trim() || typing
                      ? darkMode
                        ? "#334155"
                        : "#e2e8f0"
                      : hoveringSend
                        ? "#a83929"
                        : accent,
                  color: !input.trim() || typing ? textMuted : "#ffffff",
                  cursor: !input.trim() || typing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform:
                    hoveringSend && input.trim() && !typing
                      ? "scale(1.05)"
                      : "scale(1)",
                  transition: "all 0.15s ease",
                }}
              >
                <SendIcon size={16} />
              </button>
            </div>
            <p
              style={{
                margin: "0.4rem 0 0",
                fontSize: 10,
                textAlign: "center",
                color: darkMode ? "#334155" : "#cbd5e1",
              }}
            >
              Powered by Andromeda AI · Groq / Qwen3-32b
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DefaultBotIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SendIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
