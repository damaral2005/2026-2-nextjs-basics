"use client";

import { createStudentAction, type StudentFormState } from "@/app/(dashboard)/students/actions";
import { Gender } from "@/interfaces/student.interface";
import Link from "next/link";
import { useActionState } from "react";
import { Input } from "../form-ui/Input";
import { SubmitButton } from "../form-ui/SubmitButton";

const initialState: StudentFormState = {};

export function CreateStudentForm() {
  const [{ fields, error }, formAction, pending] = useActionState(createStudentAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre completo" name="name" defaultValue={fields?.name} required />
        <Input label="Correo electrónico" name="email" type="email" defaultValue={fields?.email} required />
        <Input label="Edad" name="age" type="number" min={1} step={1} defaultValue={fields?.age} required />
        <label htmlFor="gender" className="flex flex-col gap-1 text-sm">
          <span className="opacity-80">Género</span>
          <select id="gender" name="gender" defaultValue={fields?.gender ?? ""} required className="w-full rounded border border-gray-500 bg-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <option value="" disabled>Selecciona una opción</option>
            <option value={Gender.Female}>Femenino</option>
            <option value={Gender.Male}>Masculino</option>
            <option value={Gender.Other}>Otro</option>
          </select>
        </label>
      </div>
      <Input label="Materias favoritas (opcional)" name="subjects" placeholder="Matemáticas, Historia" defaultValue={fields?.subjects} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={fields?.isActive ?? true} className="size-4 accent-blue-600" />
        Estudiante activo
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-5">
        <div className="w-full sm:w-auto">
          <SubmitButton pending={pending} pendingText="Guardando…">Guardar estudiante</SubmitButton>
        </div>
        <Link href="/students" className="text-sm font-medium text-slate-700 underline hover:text-slate-950">Cancelar</Link>
      </div>
    </form>
  );
}
