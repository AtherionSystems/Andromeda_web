// src/hooks/useAndromedaBot.ts

import { useState, useEffect } from "react";
import { apiFetch, BASE_URL } from "../api/client";
import { loadTokens, getValidAccessToken } from "../ociAuth";

type AgentStatus = "checking" | "online" | "offline" | "disabled";

interface UseAndromedaBotReturn {
  sendMessage: (text: string) => Promise<string>;
  agentStatus: AgentStatus;
}

// Replica la misma lógica de resolveToken() de client.ts
async function resolveToken(): Promise<string | null> {
  // OCI token (prod)
  if (loadTokens() !== null) {
    try {
      return await getValidAccessToken();
    } catch {
      return null;
    }
  }
  // Dev HMAC token
  try {
    const raw = localStorage.getItem("andromeda_user");
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

export function useAndromedaBot(): UseAndromedaBotReturn {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("checking");

  // ── Verificar disponibilidad ──────────────────────────────────────────────
  // /api/ai/status devuelve text/plain — usamos fetch nativo con el token
  // resuelto igual que client.ts (OCI en prod, HMAC en dev).
  useEffect(() => {
    resolveToken().then((token) => {
      fetch(`${BASE_URL}/api/ai/status`, {
        headers: {
          Accept: "text/plain, */*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(async (res) => {
          if (res.status === 503) {
            setAgentStatus("offline");
            return;
          }
          if (!res.ok) {
            setAgentStatus("offline");
            return;
          }
          const text = await res.text();
          if (text.includes("disabled")) setAgentStatus("disabled");
          else setAgentStatus("online");
        })
        .catch(() => setAgentStatus("offline"));
    });
  }, []);

  // ── Enviar mensaje — JWT resuelto automáticamente por apiFetch ────────────
  const sendMessage = async (text: string): Promise<string> => {
    const data = await apiFetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: text }),
    });
    return data.reply;
  };

  return { sendMessage, agentStatus };
}
