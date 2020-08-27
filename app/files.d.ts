declare module 'files' {
  type HistoryFolder = {
    folderName: string;
    timestamp: number;
    dateString: string;
  };

  /* ASM types */
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
    password_policy?: 4 | 6 | 8 | null | '4' | '6' | '8' | '';
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
  type AsmClass = {
    class_id: string;
    class_number?: string | null;
    course_id: string;
    instructor_id?: string | null;
    instructor_id_2?: string | null;
    instructor_id_3?: string | null;
    instructor_id_4?: string | null;
    instructor_id_5?: string | null;
    instructor_id_6?: string | null;
    instructor_id_7?: string | null;
    instructor_id_8?: string | null;
    instructor_id_9?: string | null;
    instructor_id_10?: string | null;
    instructor_id_11?: string | null;
    instructor_id_12?: string | null;
    instructor_id_13?: string | null;
    instructor_id_14?: string | null;
    instructor_id_15?: string | null;
    instructor_id_16?: string | null;
    instructor_id_17?: string | null;
    instructor_id_18?: string | null;
    instructor_id_19?: string | null;
    instructor_id_20?: string | null;
    instructor_id_21?: string | null;
    instructor_id_22?: string | null;
    instructor_id_23?: string | null;
    instructor_id_24?: string | null;
    instructor_id_25?: string | null;
    instructor_id_26?: string | null;
    instructor_id_27?: string | null;
    instructor_id_28?: string | null;
    instructor_id_29?: string | null;
    instructor_id_30?: string | null;
    instructor_id_31?: string | null;
    instructor_id_32?: string | null;
    instructor_id_33?: string | null;
    instructor_id_34?: string | null;
    instructor_id_35?: string | null;
    instructor_id_36?: string | null;
    instructor_id_37?: string | null;
    instructor_id_38?: string | null;
    instructor_id_39?: string | null;
    instructor_id_40?: string | null;
    instructor_id_41?: string | null;
    instructor_id_42?: string | null;
    instructor_id_43?: string | null;
    instructor_id_44?: string | null;
    instructor_id_45?: string | null;
    instructor_id_46?: string | null;
    instructor_id_47?: string | null;
    instructor_id_48?: string | null;
    instructor_id_49?: string | null;
    instructor_id_50?: string | null;
    location_id: string;
    [index: string]: string | null | undefined;
  };
  type AsmRoster = {
    roster_id: string;
    class_id: string;
    student_id: string;
  };

  export type AsmFile =
    | AsmClass
    | AsmCourse
    | AsmLocation
    | AsmStaff
    | AsmStudent
    | AsmRoster;

  /* MS types v1 */

  type MsStudent = {
    'SIS ID': string;
    'School SIS ID': string;
    Username: string;
    Password: string | null;
    'First Name': string;
    'Last Name': string;
    'Middle Name': string | null;
    'Secondary Email': string | null;
    'Student Number': string | null;
    Grade: string | null;
    'State ID': string | null;
    Status: string | null;
    Birthdate: string | null;
    'Graduation Year': string | null;
  };

  type MsTeacher = {
    'SIS ID': string;
    'School SIS ID': string;
    Username: string;
    Password: string | null;
    'First Name': string;
    'Last Name': string;
    'Middle Name': string | null;
    'Secondary Email': string | null;
    'Teacher Number': string | null;
    Grade: string | null;
    'State ID': string | null;
    Status: string | null;
    Title: string | null;
    Qualification: string | null;
  };

  type MsSchool = {
    'SIS ID': string;
    Name: string;
    'School Number': string | null;
    'School NCES_ID': string | null;
    'Grade Low': string | null;
    'Grade High': string | null;
    'State ID': string | null;
    'Principal SIS ID': string | null;
    'Principal Name': string | null;
    'Principal Secondary': string | null;
    Address: string | null;
    City: string | null;
    State: string | null;
    Zip: string | null;
    Country: string | null;
    Phone: string | null;
    Zone: string | null;
  };

  type MsSection = {
    'SIS ID': string;
    'School SIS ID': string;
    'Section Name': string;
    'Section Number': string | null;
    'Term SIS ID': string | null;
    'Term Name': string | null;
    'Term StartDate': string | null;
    'Term EndDate': string | null;
    'Course SIS ID': string;
    'Course Name': string | null;
    'Course Number': string | null;
    'Course Description': string | null;
    'Course Subject': string | null;
    Periods: string | null;
    Status: string | null;
  };

  type MsStudentEnrollement = {
    'Section SIS ID': string;
    'SIS ID': string;
  };

  type MsTeacherRoster = {
    'Section SIS ID': string;
    'SIS ID': string;
  };

  export type MsFile =
    | MsSchool
    | MsStudent
    | MsTeacher
    | MsSection
    | MsStudentEnrollement
    | MsTeacherRoster;

  type FileNamesASM =
    | 'students'
    | 'staff'
    | 'classes'
    | 'rosters'
    | 'courses'
    | 'locations';
  type FileNamesMS =
    | 'student'
    | 'teacher'
    | 'school'
    | 'section'
    | 'studentenrollment'
    | 'teacherroster';

  export type FilesData = {
    [key in FileNamesASM | FileNamesMS]?: {
      inValidMessages: [];
      data: AsmFile[] | MsFile[];
    };
  }[];

  export type FilesDataASM = {
    [key in FileNamesASM]?: {
      inValidMessages: [];
      data: AsmFile[];
    };
  }[];

  export type FilesDataMS = {
    [key in FileNamesMS]?: {
      inValidMessages: [];
      data: MsFile[];
    };
  }[];
}
