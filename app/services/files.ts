import path from 'path';
import fs from 'fs';
import string from 'string-sanitizer';
import { RcFile } from 'antd/lib/upload/interface';
import streamToBlob from 'stream-to-blob';
import { archiveFolder } from 'zip-lib';
import Sftp, { ConnectOptions } from 'ssh2-sftp-client';
import {
  FilesData,
  FileNamesASM,
  FileNamesMS,
  FilesDataASM,
  FilesDataMS,
  MsSchool,
  MsStudent,
  MsTeacher,
  AsmLocation,
  AsmStudent,
  AsmStaff,
  AsmCourse,
  AsmRoster,
  AsmClass,
  MsSection,
  MsTeacherRoster,
  MsStudentEnrollement,
  HistoryFolder,
} from 'files';
// import parse from 'csv-parse/lib/sync';
// import { AsmFile } from 'files';
import CSVFileValidator from 'csv-file-validator';
// import { FileWithError } from '../components/ValidationError';
import ObjectsToCsv from 'objects-to-csv';
import getConfig from './validatorConfig';
import db from './db';
import {
  allowedFileNames,
  allowedFileNamesMSLowerNoExt,
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
        console.error(error);
      }
    }
    return false;
  });

  const fileredHistory = history.filter((element) => element !== false);
  const sortedHistory = (fileredHistory as HistoryFolder[]).sort(
    compareTimestamp
  );

  return fileredHistory;
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

export function convertData(data: FilesDataMS): FilesDataASM {
  const template = [
    { locations: { data: [] as AsmLocation[] } },
    { students: { data: [] as AsmStudent[] } },
    { staff: { data: [] as AsmStaff[] } },
    { courses: { data: [] as AsmCourse[] } },
    { classes: { data: [] as AsmClass[] } },
    { rosters: { data: [] as AsmRoster[] } },
  ];

  const indexShool = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'School');
  });
  const indexTeacher = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'Teacher');
  });
  const indexStudent = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'Student');
  });
  const indexSection = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'Section');
  });
  const indexStudentEnrollment = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'StudentEnrollment');
  });
  const indexTeacherRoster = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'TeacherRoster');
  });

  // build locations
  data[indexShool].School!.data!.forEach((x) => {
    const row = x as MsSchool;
    template[0].locations?.data.push({
      location_id: row['SIS ID'],
      location_name: row.Name,
    });
  });
  // build students
  data[indexStudent].Student!.data!.forEach((x) => {
    const row = x as MsStudent;
    template[1].students?.data.push({
      person_id: row['SIS ID'],
      person_number: row['Student Number'],
      first_name: row['First Name'],
      middle_name: row['Middle Name'],
      last_name: row['Last Name'],
      grade_level: row.Grade,
      email_address: row['Secondary Email'],
      sis_username: row.Username,
      password_policy: '',
      location_id: row['School SIS ID'],
    });
  });

  // build staff
  data[indexTeacher].Teacher!.data!.forEach((x) => {
    const row = x as MsTeacher;
    template[2].staff?.data.push({
      person_id: row['SIS ID'],
      person_number: row['Teacher Number'],
      first_name: row['First Name'],
      middle_name: row['Middle Name'],
      last_name: row['Last Name'],
      email_address: row['Secondary Email'],
      sis_username: row.Username,
      location_id: row['School SIS ID'],
    });
  });

  // build courses
  data[indexSection].Section!.data!.forEach((x) => {
    const row = x as MsSection;
    template[3].courses?.data.push({
      course_id: row['Course SIS ID'],
      course_number: row['Section Number'],
      course_name: row['Section Name'],
      location_id: row['School SIS ID'],
    });
  });

  const getInstructorSisId = (
    sectionSisId: string,
    index: number
  ): string | '' => {
    const instructors = (data[indexTeacherRoster].TeacherRoster!
      .data as MsTeacherRoster[]).filter((x) => {
      const row = x as MsTeacherRoster;
      return row['Section SIS ID'] === sectionSisId;
    });
    if (instructors[index] !== undefined) {
      return instructors[index]['SIS ID'];
    }
    return '';
  };

  // build classes
  data[indexSection].Section!.data!.forEach((x) => {
    const row = x as MsSection;

    if (Object.entries(row).length === 0) {
      template[4].classes?.data.push({} as AsmClass);
    } else {
      template[4].classes?.data.push({
        class_id: row['SIS ID'],
        class_number: row['Section Number'],
        course_id: row['Course SIS ID'],
        instructor_id: getInstructorSisId(row['SIS ID'], 0),
        instructor_id_2: getInstructorSisId(row['SIS ID'], 1),
        instructor_id_3: getInstructorSisId(row['SIS ID'], 2),
        location_id: row['School SIS ID'],
      });
    }
  });

  // build rosters
  data[indexStudentEnrollment].StudentEnrollment!.data!.forEach((x, i) => {
    const row = x as MsStudentEnrollement;
    template[5].rosters?.data.push({
      roster_id: i.toString(),
      class_id: row['Section SIS ID'],
      student_id: row['SIS ID'],
    });
  });

  return template as FilesDataASM;
}

function getData(data: FilesData, fileName: FileNamesASM | FileNamesMS) {
  const index = data.findIndex((value, i) => {
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
  return db('locations')
    .insert(getData(data, 'locations'))
    .then(() => {
      return db.batchInsert('students', getData(data, 'students'), 100);
    })
    .then(() => {
      return db.batchInsert('staff', getData(data, 'staff'), 100);
    })
    .then(() => {
      return db.batchInsert('courses', getData(data, 'courses'), 100);
    })
    .then(() => {
      return db.batchInsert('classes', getData(data, 'classes'), 100);
    })
    .then(() => {
      return db.batchInsert('rosters', getData(data, 'rosters'), 100);
    })
    .catch((err) => {
      // console.error('Error during import to DB: ', err);
      throw err;
    });
}
export function importToDb(data: FilesData, filesStandard: 'APPLE' | 'MS') {
  if (filesStandard === 'MS') {
    const convertedData = convertData(data as FilesDataMS);
    return performImport(convertedData).catch((err) => {
      throw err;
    });
  }
  return performImport(data as FilesDataASM);
}

export function validateFile(file: RcFile | string) {
  const name = typeof file === 'string' ? path.basename(file) : file.name;
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
    : areArraysEqualSets(names, allowedFileNamesMSLowerNoExt) && 'MS';

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
    .catch((err) => console.error(err));
}

export function generateFiles(
  location: string,
  data: FilesDataASM,
  fromSql?: boolean
) {
  const csvToDisk = data.map((file) => {
    const key = Object.keys(file)[0] as FileNamesASM;
    const singleFileData = fromSql ? file[key]! : file[key]!.data;
    if (!fromSql) singleFileData.shift();
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
            console.error(err);
          }
        )
        .catch((err: any) => console.error(err));
      return true;
    })
    .catch((err: any) => console.error(err));
}

export function uploadToSftp(zipFilePath: string, config: ConnectOptions) {
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
