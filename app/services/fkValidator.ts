import { AsmFile, FileNamesASM, FileNamesMS, FilesData, MsFile } from 'files';

export type FkValidationRule = {
  fk: string;
  fileName: FileNamesASM | FileNamesMS;
  pk: string;
};

export type FkValidationSchema = {
  [key in FileNamesASM | FileNamesMS]?: FkValidationRule[];
};

export default function validateFk(
  data: FilesData,
  schema: FkValidationSchema
) {
  const result: { [index: string]: string | null | undefined | any[][] } = {};
  // for each file to validate
  Object.keys(schema).forEach((primaryFileName) => {
    // for each configuration
    const fileResult: any[][] = [];
    schema[primaryFileName as FileNamesASM | FileNamesMS]!.forEach((config) => {
      const errors: any[] = [];
      const foreignFileName = config.fileName;
      const fkColumn = config.fk;
      const pkColumn = config.pk;
      const primaryFileIndex = data.findIndex((element) =>
        Object.prototype.hasOwnProperty.call(element, primaryFileName)
      );
      const primaryFileData = data[primaryFileIndex][
        primaryFileName as FileNamesASM | FileNamesMS
      ]!.data;
      const foreignFileIndex = data.findIndex((element) =>
        Object.prototype.hasOwnProperty.call(element, foreignFileName)
      );
      const foreignFileData = data[foreignFileIndex][
        foreignFileName as FileNamesASM | FileNamesMS
      ]!.data;

      // for each record in primaryFieldData look for primaryFieldData[fkColumn] in foreignFileData[pkColumn]
      primaryFileData.forEach((row: AsmFile | MsFile, index: number) => {
        const rowNumber = index;
        const fkValue = row[fkColumn];
        const relatedRow = foreignFileData.findIndex(
          (element: AsmFile | MsFile) => element[pkColumn] === fkValue
        );
        if (relatedRow === -1) {
          errors.push({ row, rowNumber, config });
        }
      });
      if (errors.length > 0) {
        fileResult.push(errors);
      }
    });
    if (fileResult.length > 0) {
      result[primaryFileName] = fileResult;
    }
  });
  return Object.keys(result).length === 0 ? false : result;
}

// {
//     student: [
//       {
//         fk: 'School SIS ID',
//         fileName: 'school',
//         pk: 'SIS ID',
//       },
//     ],
//     section: [
//       {
//         fk: 'School SIS ID',
//         fileName: 'school',
//         pk: 'SIS ID',
//       },
//     ],
//     studentenrollment: [
//       {
//         fk: 'SIS ID',
//         fileName: 'student',
//         pk: 'SIS ID',
//       },
//     ],
//     teacher: [
//       {
//         fk: 'School SIS ID',
//         fileName: 'school',
//         pk: 'SIS ID',
//       },
//     ],
//     teacherroster: [
//       {
//         fk: 'SIS ID',
//         fileName: 'teacher',
//         pk: 'SIS ID',
//       },
//     ],
//   }
