"use client";

import { registerAction, type AuthFormState } from "@/app/(auth)/actions";
import Link from "next/link";
import { useActionState } from "react";
import { Input } from "../form-ui/Input";
import { SubmitButton } from "../form-ui/SubmitButton";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Crear cuenta</h2>
        <p className="mt-1 text-sm text-slate-400">Crea tu cuenta para ingresar al dashboard.</p>
      </div>
      <Input label="Nombre completo" name="fullName" autoComplete="name" defaultValue={state.fullName} required />
      <Input label="Correo electrónico" name="email" type="email" autoComplete="email" defaultValue={state.email} required />
      <Input label="Contraseña" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={16} required />
      <p className="-mt-2 text-xs text-slate-400">Usa de 8 a 16 caracteres.</p>
      {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      <SubmitButton pending={pending} pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
      <Link href="/login" className="text-center text-sm text-slate-300 underline hover:text-white">
        Ya tengo cuenta
      </Link>
    </form>
  );
}
