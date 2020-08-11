import path from 'path';
import fs from 'fs';
import os from 'os';
import string from 'string-sanitizer';

const encoding = require('encoding-japanese');

const { remote } = require('electron');

export type Organization = {
  name: string;
  folderName: string;
};

const MAIN_FOLDER_PATH = path.join(
  remote.app.getPath('documents'),
  'ASM Data Manager'
);

export default function initMainFolder() {
  if (!fs.existsSync(MAIN_FOLDER_PATH)) {
    fs.mkdirSync(MAIN_FOLDER_PATH);
  }
}

export function getOrganizations() {
  const folders = fs
    .readdirSync(MAIN_FOLDER_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const organizations = folders.map((folder) => {
    const metadataPath = path.join(MAIN_FOLDER_PATH, folder, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        return { name: metadata.name, folderName: folder };
      } catch (error) {
        console.error(error);
      }
    }
    return { name: '_brak_metadata_', folderName: '_brak_metadata_' };
  });

  const fileredOrganizations: Organization[] = organizations.filter(
    (element) => element.name !== '_brak_metadata_'
  );

  return fileredOrganizations;
}

export function addOrganization(name: string) {
  const sanitizedName = string.sanitize(name);
  const folderPath = path.join(MAIN_FOLDER_PATH, sanitizedName);
  fs.mkdirSync(folderPath);
  fs.writeFileSync(
    path.join(folderPath, 'metadata.json'),
    JSON.stringify({ name })
  );
  return { name, folderName: sanitizedName };
}

export function validateFile(filePath: string) {
  const allowedFileNamesASM = [
    'students.csv',
    'staff.csv',
    'clases.csv',
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
  if (allowedFileNames.indexOf(path.basename(filePath)) > -1) {
    const fileBuffer = fs.readFileSync(filePath);
    const charsetMatch = encoding.detect(fileBuffer);
    console.log(charsetMatch);
    if (charsetMatch === 'UTF8') {
      console.log('is UTF8');
    } else {
      console.log(charsetMatch);
    }
  } else {
    console.log('niedozwolona nazwa pliku');
  }
}
