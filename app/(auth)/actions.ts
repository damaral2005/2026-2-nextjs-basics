"use server";

import { DEFAULT_DASHBOARD_PATH, safeDashboardPath } from "@/lib/auth-routes";
import { login, register } from "@/lib/auth-api";
import { createSession, deleteSession } from "@/lib/session";
import { isAxiosError } from "axios";
import { redirect } from "next/navigation";

export type AuthFormState = { error?: string; email?: string; fullName?: string };

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

function validCredentials(email: string, password: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8 && password.length <= 16;
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  if (!validCredentials(email, password)) {
    return { email, error: "Ingresa un correo válido y una contraseña de 8 a 16 caracteres." };
  }

  try {
    const { token } = await login(email, password);
    await createSession(token);
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    return {
      email,
      error: status === 400 || status === 401 || status === 403
        ? "Correo o contraseña incorrectos."
        : "No pudimos iniciar sesión. Inténtalo de nuevo.",
    };
  }

  redirect(safeDashboardPath(formData.get("from")) ?? DEFAULT_DASHBOARD_PATH);
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const fields = { email, fullName };

  if (!fullName || !validCredentials(email, password)) {
    return { ...fields, error: "Ingresa tu nombre, un correo válido y una contraseña de 8 a 16 caracteres." };
  }

  try {
    await register(email, password, fullName);
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    return {
      ...fields,
      error: status === 409
        ? "Ya existe una cuenta con ese correo."
        : "No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.",
    };
  }

  await deleteSession();
  redirect("/login?registered=1");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
