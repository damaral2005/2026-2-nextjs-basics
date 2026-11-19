"use server";

import { Gender } from "@/interfaces/student.interface";
import { CREATE_STUDENT_PATH, loginPath } from "@/lib/auth-routes";
import { deleteSession, requireSession } from "@/lib/session";
import { createStudent } from "@/lib/student-api";
import { isAxiosError } from "axios";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export type StudentFormState = {
  error?: string;
  fields?: { name: string; email: string; age: string; gender: string; isActive: boolean; subjects: string };
};

export async function createStudentAction(_prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const { token } = await requireSession(CREATE_STUDENT_PATH);
  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    age: String(formData.get("age") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    isActive: formData.get("isActive") === "on",
    subjects: String(formData.get("subjects") ?? ""),
  };
  const age = Number(fields.age);
  const gender = Object.values(Gender).find((option) => option === fields.gender);

  if (!fields.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || !Number.isInteger(age) || age < 1 || !gender) {
    return { fields, error: "Revisa el nombre, el correo, la edad y el género del estudiante." };
  }

  let studentId: string;
  try {
    const student = await createStudent({
      name: fields.name,
      email: fields.email,
      age,
      gender,
      isActive: fields.isActive,
      favoriteSubjects: fields.subjects.split(",").map((subject) => subject.trim()).filter(Boolean),
    }, token);
    studentId = student.id;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 401) {
      await deleteSession();
      redirect(loginPath(CREATE_STUDENT_PATH));
    }

    return {
      fields,
      error: status === 409
        ? "Ya existe un estudiante con ese correo."
        : "No pudimos guardar el estudiante. Revisa los datos e inténtalo de nuevo.",
    };
  }

  updateTag("students");
  redirect(`/students/${encodeURIComponent(studentId)}`);
}
