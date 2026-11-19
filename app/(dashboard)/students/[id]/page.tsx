import { requireSession } from '@/lib/session';
import { getStudent, type Student } from '@/lib/student-api';
import { cacheLife, cacheTag } from 'next/cache';
import React, { Suspense } from 'react'

async function getStudentById(id:string){
    "use cache"
    cacheLife("minutes");
    cacheTag("students", `student-${id}`)

    const student: Student = await getStudent(id);
    return { student, generatedAt: new Date().toISOString()};
}

async function StudentDetail({params} : Pick<PageProps<"/students/[id]">, "params">) {
    await requireSession();
    const {id}= await params;
    const {student, generatedAt} = await getStudentById(id);
  return (
    <article className='space-y-3'>
        <h1 className='text-2xl font-bold'>{student.name}</h1>
        <p>
            Email: {student.email}
        </p>
        <p>
            Nickname: @{student.nickname}
        </p>
        {!!student.grades?.length && (
            <section>
                <h2 className='text-xl font-bold'>Materias</h2>
                <ul>
                    {student.grades.map((grade) => (
                        <li key={grade.id}>{grade.subject}: {grade.grade}</li>
                    ))}
                </ul>
            </section>
        )}
        <p className='text-xs text-gray-500'> Generado el {generatedAt}</p>
    </article>
  )
}

export default function StudentDetailPage({params} : Pick<PageProps<"/students/[id]">, "params">) {
  return (
    <Suspense fallback={<p>Cargando estudiante...</p>}>
        <StudentDetail params={params}/>
    </Suspense>
  )
}
