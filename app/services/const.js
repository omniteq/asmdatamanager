import path from 'path';

const { remote } = require('electron');

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

const MAIN_FOLDER_PATH = path.join(
  remote.app.getPath('documents'),
  'ASM Data Manager'
);

const TEMP_FOLDER_PATH = path.join(MAIN_FOLDER_PATH, 'Wsylka w trakcie');

export {
  allowedFileNames,
  allowedFileNamesASM,
  allowedFileNamesMS,
  allowedFileNamesASMNoExt,
  allowedFileNamesMSLowerNoExt,
  MAIN_FOLDER_PATH,
  TEMP_FOLDER_PATH,
};
