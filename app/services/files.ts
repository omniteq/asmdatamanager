import path from 'path';
import fs from 'fs';
import string from 'string-sanitizer';
import { RcFile } from 'antd/lib/upload/interface';
import { AsmFile, AsmClass, FilesData, FileNamesASM, FileNamesMS } from 'files';
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

function getData(data: FilesData, fileName: FileNamesASM | FileNamesMS) {
  const index = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, fileName);
  });
  const fileData = [...data[index][fileName]!.data];
  fileData.shift();
  return fileData;
}
export function importToDb(data: FilesData, filesStandard: 'APPLE' | 'MS') {
  if (filesStandard === 'MS') {
    // const fileData = convertData(fileData);
  } else {
    // import to sqlite
    console.log(data);
    db('locations')
      .truncate()
      .then(() => {
        return db.insert(getData(data, 'locations'));
      })
      .then(() => {
        return db('students').truncate();
      })
      .then(() => {
        return db.insert(getData(data, 'students'));
      })
      .catch((err) => console.error(err));
  }
}

export function validateFile(file: RcFile) {
  // const filePath = file.path;

  const validationErrors = [];

  // validate file name
  if (allowedFileNames.indexOf(path.basename(file.name)) === -1) {
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

  if (validationErrors.length > 0) {
    return validationErrors;
  }
  return true;
}

export async function validateFileData(file: RcFile) {
  try {
    const result = await CSVFileValidator(file, getConfig(file.name));
    return { result, file };
  } catch (error) {
    console.error(error);
    return Promise.reject(new Error('Invalid data'));
  }
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

/** assumes array elements are primitive types
 * check whether 2 arrays are equal sets.
 * @param  {} a1 is an array
 * @param  {} a2 is an array
 */
export function areArraysEqualSets(a1: string[], a2: string[]) {
  const superSet = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const i of a1) {
    const e = i + typeof i;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    superSet[e] = 1;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const i of a2) {
    const e = i + typeof i;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!superSet[e]) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    superSet[e] = 2;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const e in superSet) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (superSet[e] === 1) {
      return false;
    }
  }

  return true;
}
