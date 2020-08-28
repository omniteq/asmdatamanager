import path from 'path';
import fs from 'fs';
import string from 'string-sanitizer';
import { RcFile } from 'antd/lib/upload/interface';
import streamToBlob from 'stream-to-blob';
import { archiveFolder } from 'zip-lib';
import Sftp, { ConnectOptions } from 'ssh2-sftp-client';
import uniqueObjects from 'unique-objects';
import fsExtra from 'fs-extra';
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
    return Object.prototype.hasOwnProperty.call(value, 'school');
  });
  const indexTeacher = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'teacher');
  });
  const indexStudent = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'student');
  });
  const indexSection = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'section');
  });
  const indexStudentEnrollment = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'studentenrollment');
  });
  const indexTeacherRoster = data.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, 'teacherroster');
  });

  // build locations
  data[indexShool].school!.data!.forEach((x, i) => {
    const row = x as MsSchool;
    template[0].locations?.data.push({
      location_id: row['SIS ID'] ? row['SIS ID'] : '',
      location_name: row.Name ? row.Name : '',
    });
  });
  // build students
  data[indexStudent].student!.data!.forEach((x) => {
    const row = x as MsStudent;
    template[1].students?.data.push({
      person_id: row['SIS ID'] ? row['SIS ID'] : '',
      person_number: row['Student Number'] ? row['Student Number'] : '',
      first_name: row['First Name'] ? row['First Name'] : '',
      middle_name: row['Middle Name'] ? row['Middle Name'] : '',
      last_name: row['Last Name'] ? row['Last Name'] : '',
      grade_level: row.Grade ? row.Grade : '',
      email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
      sis_username: row.Username ? row.Username : '',
      password_policy: '',
      location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
    });
  });

  // build staff
  data[indexTeacher].teacher!.data!.forEach((x) => {
    const row = x as MsTeacher;
    template[2].staff?.data.push({
      person_id: row['SIS ID'] ? row['SIS ID'] : '',
      person_number: row['Teacher Number'] ? row['Teacher Number'] : '',
      first_name: row['First Name'] ? row['First Name'] : '',
      middle_name: row['Middle Name'] ? row['Middle Name'] : '',
      last_name: row['Last Name'] ? row['Last Name'] : '',
      email_address: row['Secondary Email'] ? row['Secondary Email'] : '',
      sis_username: row.Username ? row.Username : '',
      location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
    });
  });

  // build courses
  data[indexSection].section!.data.forEach((x, i) => {
    const row = x as MsSection;
    if (row['Course SIS ID'] && row['Course SIS ID'].length > 0) {
      const courseExsits = template[3].courses?.data.findIndex(
        (item) => item.course_id === row['Course SIS ID']
      );
      if (courseExsits && courseExsits > 0) {
        return;
      }
    }
    template[3].courses?.data.push({
      course_id:
        (row['Course SIS ID'] !== undefined &&
          row['Course SIS ID']!.length > 0) ||
        i === 0
          ? row['Course SIS ID']
          : (1000 + i).toString(),
      course_number:
        (row['Course Number'] !== undefined &&
          row['Course Number']!.length > 0) ||
        i === 0
          ? row['Course Number']
          : (1000 + i).toString(),
      course_name:
        (row['Course Name'] !== undefined && row['Course Name']!.length > 0) ||
        i === 0
          ? row['Course Name']
          : row['Section Name'],
      location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
    });
  });

  const getInstructorSisId = (
    sectionSisId: string,
    index: number
  ): string | '' => {
    const instructors = (data[indexTeacherRoster].teacherroster!
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
  data[indexSection].section!.data!.forEach((x, i) => {
    const row = x as MsSection;

    if (Object.entries(row).length === 0) {
      template[4].classes?.data.push({} as AsmClass);
    } else {
      template[4].classes?.data.push({
        class_id: row['SIS ID'] ? row['SIS ID'] : '',
        class_number: row['Section Number'] ? row['Section Number'] : '',
        course_id:
          (row['Course SIS ID'] !== undefined &&
            row['Course SIS ID']!.length > 0) ||
          i === 0
            ? row['Course SIS ID']
            : (1000 + i).toString(),
        instructor_id: getInstructorSisId(row['SIS ID'], 0),
        instructor_id_2: getInstructorSisId(row['SIS ID'], 1),
        instructor_id_3: getInstructorSisId(row['SIS ID'], 2),
        instructor_id_4: getInstructorSisId(row['SIS ID'], 3),
        instructor_id_5: getInstructorSisId(row['SIS ID'], 4),
        instructor_id_6: getInstructorSisId(row['SIS ID'], 5),
        instructor_id_7: getInstructorSisId(row['SIS ID'], 6),
        instructor_id_8: getInstructorSisId(row['SIS ID'], 7),
        instructor_id_9: getInstructorSisId(row['SIS ID'], 8),
        instructor_id_10: getInstructorSisId(row['SIS ID'], 9),
        instructor_id_11: getInstructorSisId(row['SIS ID'], 10),
        instructor_id_12: getInstructorSisId(row['SIS ID'], 11),
        instructor_id_13: getInstructorSisId(row['SIS ID'], 12),
        instructor_id_14: getInstructorSisId(row['SIS ID'], 13),
        instructor_id_15: getInstructorSisId(row['SIS ID'], 14),
        instructor_id_16: getInstructorSisId(row['SIS ID'], 15),
        instructor_id_17: getInstructorSisId(row['SIS ID'], 16),
        instructor_id_18: getInstructorSisId(row['SIS ID'], 17),
        instructor_id_19: getInstructorSisId(row['SIS ID'], 18),
        instructor_id_20: getInstructorSisId(row['SIS ID'], 19),
        instructor_id_21: getInstructorSisId(row['SIS ID'], 20),
        instructor_id_22: getInstructorSisId(row['SIS ID'], 21),
        instructor_id_23: getInstructorSisId(row['SIS ID'], 22),
        instructor_id_24: getInstructorSisId(row['SIS ID'], 23),
        instructor_id_25: getInstructorSisId(row['SIS ID'], 24),
        instructor_id_26: getInstructorSisId(row['SIS ID'], 25),
        instructor_id_27: getInstructorSisId(row['SIS ID'], 26),
        instructor_id_28: getInstructorSisId(row['SIS ID'], 27),
        instructor_id_29: getInstructorSisId(row['SIS ID'], 28),
        instructor_id_30: getInstructorSisId(row['SIS ID'], 29),
        instructor_id_31: getInstructorSisId(row['SIS ID'], 30),
        instructor_id_32: getInstructorSisId(row['SIS ID'], 31),
        instructor_id_33: getInstructorSisId(row['SIS ID'], 33),
        instructor_id_34: getInstructorSisId(row['SIS ID'], 34),
        instructor_id_35: getInstructorSisId(row['SIS ID'], 35),
        instructor_id_36: getInstructorSisId(row['SIS ID'], 36),
        instructor_id_37: getInstructorSisId(row['SIS ID'], 37),
        instructor_id_38: getInstructorSisId(row['SIS ID'], 38),
        instructor_id_39: getInstructorSisId(row['SIS ID'], 39),
        instructor_id_40: getInstructorSisId(row['SIS ID'], 40),
        instructor_id_41: getInstructorSisId(row['SIS ID'], 41),
        instructor_id_42: getInstructorSisId(row['SIS ID'], 42),
        instructor_id_43: getInstructorSisId(row['SIS ID'], 43),
        instructor_id_44: getInstructorSisId(row['SIS ID'], 44),
        instructor_id_45: getInstructorSisId(row['SIS ID'], 45),
        instructor_id_46: getInstructorSisId(row['SIS ID'], 46),
        instructor_id_47: getInstructorSisId(row['SIS ID'], 47),
        instructor_id_48: getInstructorSisId(row['SIS ID'], 48),
        instructor_id_49: getInstructorSisId(row['SIS ID'], 49),
        instructor_id_50: getInstructorSisId(row['SIS ID'], 50),
        location_id: row['School SIS ID'] ? row['School SIS ID'] : '',
      });
    }
  });

  // build rosters
  data[indexStudentEnrollment].studentenrollment!.data!.forEach((x, i) => {
    const row = x as MsStudentEnrollement;
    template[5].rosters?.data.push({
      roster_id: i.toString(),
      class_id: row['Section SIS ID'] ? row['Section SIS ID'] : '',
      student_id: row['SIS ID'] ? row['SIS ID'] : '',
    });
  });

  // remove unnecessary instructor fields
  let maxInstructor: number;
  for (let i = 4; i < 51; i += 1) {
    const nthValues = template[4].classes?.data.filter((item) => {
      return (
        item[`instructor_id_${i.toString()}`] &&
        item[`instructor_id_${i.toString()}`]!.length > 0
      );
    });
    if (nthValues && nthValues.length < 1) {
      maxInstructor = i - 1;
      break;
    }
  }
  template[4].classes?.data.forEach((item) => {
    for (let i = maxInstructor + 1; i < 51; i += 1) {
      delete item[`instructor_id_${i.toString()}`];
    }
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
export function importToDb(data: FilesData, filesStandard: 'APPLE' | 'MS') {
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
    .catch((err) => console.error(err));
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
    const itemPassPolicy = (item as AsmStudent).password_policy;
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
