import path from 'path';
import fs from 'fs';
import string from 'string-sanitizer';
import { RcFile } from 'antd/lib/upload/interface';
import streamToBlob from 'stream-to-blob';
import { archiveFolder } from 'zip-lib';
import Sftp from 'ssh2-sftp-client';
import fsExtra from 'fs-extra';
import log from 'electron-log';
import {
  FilesData,
  FileNamesASM,
  FileNamesMS,
  FilesDataASM,
  AsmStudent,
  HistoryFolder,
  AsmFile,
} from 'files';
// import parse from 'csv-parse/lib/sync';
// import { AsmFile } from 'files';
import CSVFileValidator from 'csv-file-validator';
// import { FileWithError } from '../components/ValidationError';
import { LabeledValue } from 'antd/lib/select';
import ObjectsToCsv from 'objects-to-csv';
import getConfig from './validatorConfig';
import db from './db';
import {
  allowedFileNames,
  allowedFileNamesMSNoExt,
  allowedFileNamesASM,
  MAIN_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from './const';

export type Organization = {
  name: string;
  folderName: string;
};

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
        log.error(err);
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

export function getHistory(organization: Organization) {
  const compareTimestamp = (a: HistoryFolder, b: HistoryFolder) =>
    b.timestamp - a.timestamp;
  const folders = fs
    .readdirSync(path.join(MAIN_FOLDER_PATH, organization.folderName), {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const history = folders.map((folder) => {
    const metadataPath = path.join(
      MAIN_FOLDER_PATH,
      organization.folderName,
      folder,
      'metadata.json'
    );
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata: { timestamp: string } = JSON.parse(
          fs.readFileSync(metadataPath, 'utf-8')
        );
        return {
          folderName: folder,
          timestamp: parseInt(metadata.timestamp, 10),
          dateString: new Date(
            parseInt(metadata.timestamp, 10)
          ).toLocaleString(),
        };
      } catch (error) {
        log.error(err);
        console.error(error);
      }
    }
    return false;
  });

  const fileredHistory = history.filter((element) => element !== false);
  const sortedHistory = (fileredHistory as HistoryFolder[]).sort(
    compareTimestamp
  );

  return sortedHistory;
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
  const index = data.findIndex((value) => {
    return Object.prototype.hasOwnProperty.call(value, fileName);
  });
  const fileData = [...data[index][fileName]!.data];
  fileData.shift();
  return fileData;
}

export function clearDbNew() {
  return db('rosters')
    .where('historical', 0)
    .orWhereNull('historical')
    .del()
    .then(() => {
      return db('classes')
        .where('historical', 0)
        .orWhereNull('historical')
        .del();
    })
    .then(() => {
      return db('courses')
        .where('historical', 0)
        .orWhereNull('historical')
        .del();
    })
    .then(() => {
      return db('staff').where('historical', 0).orWhereNull('historical').del();
    })
    .then(() => {
      return db('students')
        .where('historical', 0)
        .orWhereNull('historical')
        .del();
    })
    .then(() => {
      return db('locations')
        .where('historical', 0)
        .orWhereNull('historical')
        .del();
    });
}

export function clearDbAll() {
  return db('rosters')
    .truncate()
    .then(() => {
      return db('classes').truncate();
    })
    .then(() => {
      return db('courses').truncate();
    })
    .then(() => {
      return db('staff').truncate();
    })
    .then(() => {
      return db('students').truncate();
    })
    .then(() => {
      return db('locations').truncate();
    });
}

export function clearDbHistorical() {
  return db('rosters')
    .where('historical', 1)
    .del()
    .then(() => {
      return db('classes').where('historical', 1).del();
    })
    .then(() => {
      return db('courses').where('historical', 1).del();
    })
    .then(() => {
      return db('staff').where('historical', 1).del();
    })
    .then(() => {
      return db('students').where('historical', 1).del();
    })
    .then(() => {
      return db('locations').where('historical', 1).del();
    });
}

function performImport(data: FilesDataASM) {
  return db
    .batchInsert('locations', getData(data, 'locations'), 10)
    .then(() => {
      return db.batchInsert('students', getData(data, 'students'), 10);
    })
    .then(() => {
      return db.batchInsert('staff', getData(data, 'staff'), 10);
    })
    .then(() => {
      return db.batchInsert('courses', getData(data, 'courses'), 10);
    })
    .then(() => {
      return db.batchInsert('classes', getData(data, 'classes'), 10);
    })
    .then(() => {
      return db.batchInsert('rosters', getData(data, 'rosters'), 10);
    })
    .catch((err) => {
      // console.error('Error during import to DB: ', err);
      throw err;
    });
}
export function importToDb(data: FilesData) {
  // if (filesStandard === 'MS') {
  //   const convertedData = convertData(data as FilesDataMS);
  //   return performImport(convertedData).catch((err) => {
  //     throw err;
  //   });
  // }
  return performImport(data as FilesDataASM);
}

export function validateFile(file: RcFile | string) {
  const name =
    typeof file === 'string'
      ? path.basename(file.toLowerCase())
      : file.name.toLowerCase();
  const type = typeof file === 'string' ? path.extname(file) : file.type;

  const validationErrors = [];

  // validate file name
  if (allowedFileNames.indexOf(name) === -1) {
    validationErrors.push('FILENAME');
  }

  // validate file type
  if (type !== 'text/csv' && type !== '.csv') {
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
    log.error(err);
    return Promise.reject(new Error('Invalid data'));
  }
}

export function validateFileList(fileList: RcFile[] | string[]) {
  const validatedFiles = (fileList as Array<RcFile | string>).map((item) => {
    const isValid = validateFile(item);
    if (isValid !== true) {
      const fileWithErrors = {
        file: item,
        validationErrors: isValid,
      };
      return fileWithErrors;
    }
    return item;
  });

  const wrongFiles = validatedFiles.filter((item) => {
    return Object.prototype.hasOwnProperty.call(item, 'validationErrors');
  });

  const validFiles = validatedFiles.filter((item) => {
    return !Object.prototype.hasOwnProperty.call(item, 'validationErrors');
  });

  return { wrongFiles, validFiles };
}

export async function validateFileListData(
  fileList: File[],
  wrongOnly?: boolean
) {
  const validateList = async () => {
    return Promise.all(
      fileList.map((item) => {
        return validateFileData(item as RcFile);
      })
    );
  };
  const result = await validateList();

  if (wrongOnly) {
    return result.filter((item) => {
      return item.result.inValidMessages.length > 0;
    });
  }

  return result;
}

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

export function getFileNamesFromDir(relativePath: string) {
  const names = fs
    .readdirSync(path.join(MAIN_FOLDER_PATH, relativePath), {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isFile() && dirent.name !== 'metadata.json')
    .map((dirent) => dirent.name);
  const filesStandard = areArraysEqualSets(names, allowedFileNamesASM)
    ? 'APPLE'
    : areArraysEqualSets(names, allowedFileNamesMSNoExt) && 'MS';

  return { names, filesStandard };
}

export function getFilesFromDir(relativePath: string) {
  const fileNames = getFileNamesFromDir(relativePath);
  const blobs = fileNames.names.map((name) => {
    const file = fs.createReadStream(
      path.join(MAIN_FOLDER_PATH, relativePath, name)
    );
    return streamToBlob(file, 'text/csv');
  });

  return Promise.all(blobs)
    .then(
      (result) => {
        return fileNames.names.map((name, i) => {
          fs.createReadStream(path.join(MAIN_FOLDER_PATH, relativePath, name));
          return new File([result[i]], name, { type: 'text/csv' });
        });
      },
      (reason) => reason
    )
    .catch((err) => {
      log.error(err);
      console.error(err);
    });
}

export function generateFiles(
  location: string,
  data: FilesDataASM,
  noFirstBlank?: boolean
) {
  const csvToDisk = data.map((file) => {
    const key = Object.keys(file)[0] as FileNamesASM;
    const singleFileData =
      file[key]!.data !== undefined ? file[key]!.data : file[key];
    // if (Object.keys((singleFileData as AsmFile[])[0]).length === 0)
    //   (singleFileData as AsmFile[]).shift();
    if ((singleFileData as AsmFile[]).length > 1 && !noFirstBlank)
      (singleFileData as AsmFile[]).shift();
    const csv = new ObjectsToCsv(singleFileData);
    return csv.toDisk(path.join(location, `${key}.csv`));
  });

  return Promise.all(csvToDisk);
}

export function getPreviewNewStudents() {
  return db('students')
    .where({ historical: 0 })
    .orWhereNull('historical')
    .select();
}

export function getPreviewHistoricalStudents() {
  return db('students').where({ historical: 1 }).select();
}

export function getPreviewNewClasses() {
  return db('classes')
    .leftJoin('courses', function () {
      this.on('classes.course_id', '=', 'courses.course_id');
    })
    .leftJoin('rosters', function () {
      this.on('classes.class_id', '=', 'rosters.class_id');
    })
    .leftJoin('staff', function () {
      this.on('classes.instructor_id', '=', 'staff.person_id')
        .orOn('classes.instructor_id_2', '=', 'staff.person_id')
        .orOn('classes.instructor_id_3', '=', 'staff.person_id');
    })
    .where({ 'classes.historical': 0 })
    .orWhereNull('classes.historical')
    .select()
    .groupBy('classes.class_id');
}

export function getPreviewHistoricalClasses() {
  return db('classes')
    .leftJoin('courses', function () {
      this.on('classes.course_id', '=', 'courses.course_id');
    })
    .leftJoin('rosters', function () {
      this.on('classes.class_id', '=', 'rosters.class_id');
    })
    .leftJoin('staff', function () {
      this.on('classes.instructor_id', '=', 'staff.person_id')
        .orOn('classes.instructor_id_2', '=', 'staff.person_id')
        .orOn('classes.instructor_id_3', '=', 'staff.person_id');
    })
    .where({ 'classes.historical': 1 })
    .select()
    .groupBy('classes.class_id');
}

export function getPreviewNewStaff() {
  return db('staff')
    .where({ historical: 0 })
    .orWhereNull('historical')
    .select();
}

export function getPreviewHistoricalStaff() {
  return db('staff').where({ historical: 1 }).select();
}

export function removeHistoricalProperty(data: any) {
  const dataWithoutHistory = data.map((item: any) => {
    delete item.historical;
    return item;
  });
  return dataWithoutHistory;
}

export function getOrganizationMetadata(organizationFolder: string) {
  return JSON.parse(
    fs.readFileSync(
      path.join(MAIN_FOLDER_PATH, organizationFolder, 'metadata.json'),
      'utf-8'
    )
  );
}

export function setOrganizationMetadata(
  organizationFolder: string,
  data: {
    name?: string;
    hostname?: string;
    username?: string;
  }
) {
  const metadata = getOrganizationMetadata(organizationFolder);
  return fs.writeFileSync(
    path.join(MAIN_FOLDER_PATH, organizationFolder, 'metadata.json'),
    JSON.stringify({ ...metadata, ...data })
  );
}

export function preparePackage(data: FilesDataASM) {
  const pathFilesTemp = path.join(TEMP_FOLDER_PATH, 'pliki');
  if (!fs.existsSync(TEMP_FOLDER_PATH)) {
    fs.mkdirSync(TEMP_FOLDER_PATH);
  }
  if (!fs.existsSync(pathFilesTemp)) {
    fs.mkdirSync(pathFilesTemp);
  }

  return generateFiles(pathFilesTemp, data, true)
    .then(() => {
      archiveFolder(pathFilesTemp, path.join(TEMP_FOLDER_PATH, 'archiwum.zip'))
        .then(
          function () {
            return true;
          },
          function (err) {
            log.error(err);
            console.error(err);
          }
        )
        .catch((err: any) => console.error(err));
      return true;
    })
    .catch((err: any) => console.error(err));
}

export function uploadToSftp(
  zipFilePath: string,
  config: { host: any; port: number; username: any; password: any }
) {
  const sftpClient = new Sftp();

  return sftpClient
    .connect(config)
    .then(() => {
      return sftpClient.put(zipFilePath, '/archiwum.zip');
    })
    .then(() => {
      return sftpClient.end();
    });
  // .catch((err) => {
  //   console.error(err.message);
  // });
}

export function archiveSendFiles(organizationFolder: string) {
  const date = new Date();
  const archiveFolderPath = path.join(
    MAIN_FOLDER_PATH,
    organizationFolder,
    `${date.getDay()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
  );
  fsExtra.moveSync(path.join(TEMP_FOLDER_PATH, 'pliki'), archiveFolderPath);
  fs.writeFileSync(
    path.join(archiveFolderPath, 'metadata.json'),
    JSON.stringify({ timestamp: Date.now() })
  );
  fs.unlinkSync(path.join(TEMP_FOLDER_PATH, 'archiwum.zip'));
  return archiveFolderPath;
}

export function addPassPolicy(data: FilesData, passPolicy: LabeledValue) {
  const index = data.findIndex((element) =>
    Object.prototype.hasOwnProperty.call(element, 'students')
  );
  (data as FilesDataASM)[index].students!.data.forEach((item, i) => {
    const itemPassPolicy = (item as AsmStudent).password_policy!;
    if (!['4', '6', '8', 4, 6, 8].includes(itemPassPolicy)) {
      (data[index].students!.data[
        i
      ] as AsmStudent).password_policy = passPolicy.value as '4' | '6' | '8';
    }
  });
  return data;
}

export function removeFolder(dirToDelete: string) {
  const dirToRemove = path.join(MAIN_FOLDER_PATH, dirToDelete);
  fs.rmdirSync(dirToRemove, { recursive: true });
}
