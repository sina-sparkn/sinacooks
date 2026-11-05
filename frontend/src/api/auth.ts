import { apiClient } from "./client.js";
import type { User } from "./types.js";

export async function fetchMe(): Promise<User | null> {
  try {
    return await apiClient<User>("auth/me");
  } catch {
    return null;
  }
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<User> {
  return apiClient<User>("auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: {
  email: string;
  password: string;
  displayName: string;
}): Promise<User> {
  return apiClient<User>("auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>("auth/logout", {
    method: "POST",
  });
}
