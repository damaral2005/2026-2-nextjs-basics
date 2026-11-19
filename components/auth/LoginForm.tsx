"use client";

import { loginAction, type AuthFormState } from "@/app/(auth)/actions";
import Link from "next/link";
import { useActionState } from "react";
import { Input } from "../form-ui/Input";
import { SubmitButton } from "../form-ui/SubmitButton";

const initialState: AuthFormState = {};

export function LoginForm({ from, registered }: { from?: string; registered: boolean }) {
    const [state, formAction, pending] = useActionState(loginAction, initialState);
    return (
        <form action={formAction} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>
            {registered && <p role="status" className="text-sm text-emerald-300">Cuenta creada. Ya puedes iniciar sesión.</p>}
            {from && (
                <p className="rounded bg-slate-700 px-3 py-2 text-sm text-slate-200">
                    Inicia sesión para continuar al dashboard.
                </p>
            )}
            <input type="hidden" name="from" value={from ?? ""} />
            <Input label="Correo electrónico" name="email" type="email" autoComplete="username" defaultValue={state.email} required />
            <Input label="Contraseña" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={16} />
            {state.error && (
                <p role="alert" className="text-sm text-red-400">
                    {state.error}
                </p>
            )}
            <SubmitButton pending={pending} pendingText="Ingresando...">
                Ingresar
            </SubmitButton>
            <Link href="/register" className="text-center text-sm text-slate-300 underline hover:text-white">
                Crear cuenta
            </Link>
        </form>
    );
}
