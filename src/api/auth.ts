import { apiFetch } from "./client";
import type { ApiUser, LoginRequest } from "../types/api";

export const login = (body: LoginRequest): Promise<ApiUser> =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
