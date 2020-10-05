import { AsmFile, FileNamesASM, FileNamesMS, FilesData, MsFile } from 'files';

type ValidationResult = {
  [index: string]: string | null | undefined | any[][];
};

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
  const result: ValidationResult = {};
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

export function removeBadData(
  newFilesData: FilesData,
  result: ValidationResult,
  filesToClear: FileNamesASM[] | FileNamesMS[]
): FilesData {
  const cleardNewFilesData = JSON.parse(JSON.stringify(newFilesData));
  filesToClear.forEach((fileName: FileNamesASM | FileNamesMS) => {
    const fileResult = result[fileName];
    const filesDataIndex = newFilesData.findIndex((element) =>
      Object.prototype.hasOwnProperty.call(element, fileName)
    );
    if (Array.isArray(fileResult)) {
      fileResult.forEach((arrayOfErrors) => {
        arrayOfErrors.forEach((error) => {
          const filteredData = newFilesData[filesDataIndex][
            fileName
          ].data.filter((row) => {
            return row[error.config.fk] !== error.row[error.config.fk];
          });
          cleardNewFilesData[filesDataIndex][fileName].data = filteredData;
        });
      });
    }
  });
  return cleardNewFilesData;
}
