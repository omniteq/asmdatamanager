import path from 'path';
import fs from 'fs';
import string from 'string-sanitizer';
import { RcFile } from 'antd/lib/upload/interface';
// import parse from 'csv-parse/lib/sync';
// import { AsmFile } from 'files';
import CSVFileValidator from 'csv-file-validator';
import getConfig from './validatorConfig';
import db from './db';
import { allowedFileNames } from './const';

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

export function getErrorDesc(error: string) {
  switch (error) {
    case 'UTF8':
      return 'Niepoprawne kodowanie. Wymagane kodowanie to UTF-8.';
    case 'FILENAME':
      return 'Niepoprawna nazwa pliku. Dozwolone są nazwy zgodne ze standardem Apple ASM lub Microsoft School Data Sync';
    case 'FILETYPE':
      return 'Niepoprawny typ pliku. Dozwolone są pliki w formacie csv.';
    default:
      return 'Nieznany błąd';
  }
}

function insertData(file: RcFile) {
  // const csv = fs.readFileSync(file.path);
  // const records: AsmFile[] = parse(csv, {
  //   columns: true,
  //   skip_empty_lines: true,
  // });
  // console.log(records);
  // records.forEach((arguments) => statement)
}

export function validateFile(file: RcFile) {
  // const filePath = file.path;

  const validationErrors = [];

  // validate file name
  if (allowedFileNames.indexOf(path.basename(file.name.toLowerCase())) === -1) {
    validationErrors.push('FILENAME');
  }

  // validate encoding
  // tried two different packages, none of them works
  // const fileBuffer = fs.readFileSync(filePath);
  // const charsetMatch = detectCharacterEncoding(fileBuffer);
  // if (charsetMatch !== 'UTF8') {
  //   validationErrors.push('UTF8');
  // }

  // validate file type
  if (file.type !== 'text/csv') {
    validationErrors.push('FILETYPE');
  }

  insertData(file);

  if (validationErrors.length > 0) {
    return validationErrors;
  }
  return true;
}

// export function validateFileList(fileList: RcFile[]) {
//   const validatedFiles = fileList.map((item) => {
//     const isValid = validateFile(item);
//     if (isValid !== true) {
//       const fileWithErrors: FileWithError = {
//         file: item,
//         validationErrors: isValid,
//       };
//       return fileWithErrors;
//     }
//     return item;
//   });

//   const wrongFiles = validatedFiles.filter((item) => {
//     return Object.prototype.hasOwnProperty.call(item, 'validationErrors');
//   });

//   const validFiles = validatedFiles.filter((item) => {
//     return !Object.prototype.hasOwnProperty.call(item, 'validationErrors');
//   });

//   return { wrongFiles, validFiles };
// }

export async function validateFileData(file: RcFile) {
  try {
    const result = await CSVFileValidator(file, getConfig(file.name));
    return { result, file };
  } catch (error) {
    console.error(error);
    return Promise.reject(new Error('Invalid data'));
  }
}

// export async function validateFileListData(
//   fileList: RcFile[],
//   wrongOnly: boolean
// ) {
//   const validateList = async () => {
//     return Promise.all(
//       fileList.map((item) => {
//         return validateFileData(item as RcFile);
//       })
//     );
//   };
//   const result = await validateList();

//   if (wrongOnly) {
//     return result.filter((item) => {
//       return (item as FileWithDataValidation).result.inValidMessages.length > 0;
//     });
//   }

//   return result;
// }
