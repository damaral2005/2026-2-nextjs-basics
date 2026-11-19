import { CreateStudentForm } from "@/components/students/CreateStudentForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Crear estudiante" };

export default function NewStudentPage() {
  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Crear estudiante</h1>
      <CreateStudentForm />
    </section>
  );
}
