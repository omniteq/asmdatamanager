import path from 'path';

const allowedFileNamesASM = [
  'students.csv',
  'staff.csv',
  'classes.csv',
  'rosters.csv',
  'courses.csv',
  'locations.csv',
];
const allowedFileNamesMS = [
  'Student.csv',
  'Teacher.csv',
  'School.csv',
  'Section.csv',
  'StudentEnrollment.csv',
  'TeacherRoster.csv',
];
const allowedFileNamesASMNoExt = allowedFileNamesASM.map(
  (i) => path.parse(i).name
);
const allowedFileNamesMSLowerNoExt = allowedFileNamesMS.map(
  (i) => path.parse(i).name
);

const allowedFileNames = [...allowedFileNamesASM, ...allowedFileNamesMS];

export {
  allowedFileNames,
  allowedFileNamesASM,
  allowedFileNamesMS,
  allowedFileNamesASMNoExt,
  allowedFileNamesMSLowerNoExt,
};
