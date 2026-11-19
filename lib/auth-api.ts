import "server-only";
import { api, bearerHeaders } from "./api";

export type UserProfile = { id: string; email: string; fullName: string };

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string }>("/user/auth", { email, password });
  if (!data?.token) throw new Error("The authentication API did not return an access token.");
  return data;
}

export async function register(email: string, password: string, fullName: string) {
  const { data } = await api.post<UserProfile>("/user/signup", { email, password, fullName });
  if (!data?.id) throw new Error("The authentication API did not return a user ID.");
  return data;
}

export async function getProfile(token: string) {
  const { data } = await api.get<UserProfile>("/user/me", { headers: bearerHeaders(token) });
  return data;
}
