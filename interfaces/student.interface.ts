export interface Student {
    id:               string;
    name:             string;
    age:              number;
    email:            string;
    isActive:         boolean;
    gender:           Gender;
    favoriteSubjects: string[];
    nickname:         string;
    grades:           Grade[];
}

export type CreateStudentInput = Pick<Student, "name" | "age" | "email" | "gender" | "isActive" | "favoriteSubjects">;


export enum Gender {
    Female = "Female",
    Male = "Male",
    Other = "Other",
}

export interface Grade {
    id:      string;
    subject: string;
    grade:   number;
}
