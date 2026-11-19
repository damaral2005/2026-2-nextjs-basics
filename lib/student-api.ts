import { cacheLife, cacheTag } from 'next/cache';
import { type CreateStudentInput, type Grade, type Student } from '../interfaces/student.interface';
import { api, bearerHeaders } from './api';


export type { Grade, Student}

export async function getStudents(limit: number = 1000){
    "use cache";
    cacheLife("minutes");
    cacheTag("students");

    const {data} = await api.get<Student[]>("/student", {params: {limit}});
    return data;
}
export async function getStudent(term: string){
    "use cache";
    cacheLife("minutes");
    cacheTag("student");

    try{
    const {data} = await api.get<Student>(`/student/${encodeURIComponent(term)}`);
    return data;
    }catch(error){
        throw error;
    }
}

export async function createStudent(student: CreateStudentInput, token: string) {
    const { data } = await api.post<Student>("/student", student, { headers: bearerHeaders(token) });
    if (!data?.id) throw new Error("The student API did not return a student ID.");
    return data;
}
