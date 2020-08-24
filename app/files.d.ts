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
    location_id: string;
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
    | 'Student'
    | 'Teacher'
    | 'School'
    | 'Section'
    | 'StudentEnrollment'
    | 'TeacherRoster';

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
