import { apiFetch } from "./client";
import type { ApiUser, LoginRequest } from "../types/api";

export const login = (body: LoginRequest): Promise<ApiUser> =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getUsers = (): Promise<ApiUser[]> => apiFetch("/api/users");

export const getUserById = (id: number): Promise<ApiUser> =>
  apiFetch(`/api/users/${id}`);