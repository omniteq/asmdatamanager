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
} from 'files';

export type FilesASM = [
  { locations: { inValidMessages: []; data: AsmLocation[] } },
  { students: { inValidMessages: []; data: AsmStudent[] } },
  { staff: { inValidMessages: []; data: AsmStaff[] } },
  { courses: { inValidMessages: []; data: AsmCourse[] } },
  { classes: { inValidMessages: []; data: AsmClass[] } },
  { rosters: { inValidMessages: []; data: AsmRoster[] } }
];

export type Options = {
  mergeClasses?: boolean;
  singleCourse?: boolean;
  singleCourseName?: string;
  classNumberColumnName?:
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
  classYear?: number;
};
