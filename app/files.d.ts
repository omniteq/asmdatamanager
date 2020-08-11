/* ASM types */

declare module 'files' {
  type AsmLocation = {
    location_id: string;
    location_name: string;
  };

  type AsmStudent = {
    person_id: string;
    person_number?: string | null;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    grade_level?: string | null;
    email_address?: string | null;
    sis_username?: string | null;
    password_policy?: 4 | 6 | 8 | null | '4' | '6' | '8';
    location_id: string;
  };

  type AsmStaff = {
    person_id: string;
    person_number?: string | null;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email_address?: string | null;
    sis_username?: string | null;
    location_id: string;
  };
  type AsmCourse = {
    course_id: string;
    course_number?: string | null;
    course_name?: string | null;
    location_id: string;
  };
  export type AsmClass = {
    class_id: string;
    class_number?: string | null;
    course_id: string;
    instructor_id?: string | null;
    instructor_id_2?: string | null;
    instructor_id_3?: string | null;
    location_id: string;
  };
  export type AsmRoster = {
    roster_id: string;
    class_id: string;
    student_id: string;
  };

  export type AsmFile = AsmClass &
    AsmCourse &
    AsmLocation &
    AsmStaff &
    AsmStudent &
    AsmRoster;
}
