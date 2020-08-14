const allowedFileNamesASM = [
  'students.csv',
  'staff.csv',
  'classes.csv',
  'rosters.csv',
  'courses.csv',
  'locations.csv',
];
const allowedFileNamesMS = [
  'student.csv',
  'teacher.csv',
  'school.csv',
  'section.csv',
  'studentenrollment.csv',
  'teacherroster.csv',
];
const allowedFileNames = [...allowedFileNamesASM, ...allowedFileNamesMS];

export { allowedFileNames, allowedFileNamesASM, allowedFileNamesMS };
