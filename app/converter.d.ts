import {
  FileNamesASM,
  FileNamesMS,
  AsmFile,
  MsFile,
  AsmLocation,
  AsmStudent,
  AsmStaff,
  AsmCourse,
  AsmClass,
  AsmRoster,
  MsSection,
} from 'files';

export type FilesASM = [
  { locations: { inValidMessages: []; data: AsmLocation[] } },
  { students: { inValidMessages: []; data: AsmStudent[] } },
  { staff: { inValidMessages: []; data: AsmStaff[] } },
  { courses: { inValidMessages: []; data: AsmCourse[] } },
  { classes: { inValidMessages: []; data: AsmClass[] } },
  { rosters: { inValidMessages: []; data: AsmRoster[] } }
];

type SectionColumns =
  | 'SIS ID'
  | 'School SIS ID'
  | 'Section Name'
  | 'Section Number'
  | 'Term SIS ID'
  | 'Term Name'
  | 'Term StartDate'
  | 'Term EndDate'
  | 'Course SIS ID'
  | 'Course Name'
  | 'Course Number'
  | 'Course Description'
  | 'Course Subject'
  | 'Periods'
  | 'Status';

export type Parser = {
  columnName?: string;
  fileName?: FileNamesASM | FileNamesMS;
  parserFunc: (value: string | null) => string;
  // HACK: subject parser
  isSubject?: boolean;
};

export type Options = {
  mergeClasses?: boolean;
  mergeCourses?: boolean;
  subjectColumnName?: SectionColumns;
  subjectDestColumnName?: 'course_name' | 'class_number';
  singleCourse?: boolean;
  singleCourseName?: string;
  classNumberColumnName?: SectionColumns;
  classYear?: number;
  parsers?: Parser[];
};
