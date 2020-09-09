import { MsSection } from 'files';
import { SectionColumns } from '../converter';
import { removeSubstrings } from './parser';

type Selection = {
  selection: string;
  selectionStart: number;
  selectionEnd: number;
};

export default function findObjectByProperty(
  array: any[],
  propertyName: string
) {
  const index = array.findIndex((value, i) => {
    return Object.prototype.hasOwnProperty.call(value, propertyName);
  });
  return index;
}

export function calculateParserFuncOptions(
  selection: Selection,
  preview: string | null,
  strToRemove: string[] | undefined,
  columnName: SectionColumns,
  data: MsSection[],
  multipleWords?: boolean
) {
  const dataShifted = [...data];
  let separator: string | null = null;
  let firstWord = 1;
  let position: 'left' | 'right' | 'middle' | null = null;

  if (dataShifted && Object.entries(dataShifted[0]).length < 1) {
    dataShifted.shift();
  }
  if (selection?.selectionStart === 0) position = 'left';
  if (selection?.selectionEnd === preview!.length) position = 'right';
  if (
    selection?.selectionStart !== 0 &&
    selection?.selectionEnd !== preview!.length
  )
    position = 'middle';

  // find separator
  if (position !== null) {
    switch (position) {
      case 'left':
      case 'middle':
        separator = preview![selection!.selectionEnd!];
        break;
      case 'right':
        separator = preview![selection!.selectionStart! - 1];
        break;

      default:
        break;
    }
  }
  if (separator === null || separator === undefined) {
    throw new Error('error during separator detection');
  }

  // for middle word index find
  // BUG: cant count words from left and right based on start and end position - string can have differen length like `4a Język polski (SP14) [2019/2020]` and `4a Etyka (SP14) [2019/2020]`
  let rightWordsEqual = false;
  let countWordsRight = preview
    ?.substring(selection.selectionEnd + 1, preview.length)
    .split(separator).length;

  const countWordsLeft = preview
    ?.substring(0, selection.selectionStart - 1)
    .split(separator).length;

  const leftWordsEqual = dataShifted?.every((element) => {
    let text = element[columnName];
    if (strToRemove) {
      text = text ? removeSubstrings(element[columnName]!, strToRemove) : text;
    }
    return (
      text?.substring(0, selection.selectionStart - 1).split(separator!)
        .length === countWordsLeft
    );
  });

  if (!leftWordsEqual) {
    countWordsRight = preview
      ?.substring(selection.selectionEnd + 1, preview.length)
      .split(separator).length;

    rightWordsEqual = dataShifted?.every((element) => {
      let text = element[columnName];
      if (strToRemove) {
        text = text
          ? removeSubstrings(element[columnName]!, strToRemove)
          : text;
      }
      return (
        text
          ?.substring(selection.selectionEnd + 1, preview!.length)
          .split(separator!).length === countWordsRight
      );
    });
  }

  // find word index
  if (position !== null) {
    switch (position) {
      case 'left':
        firstWord = 1;
        break;
      case 'middle':
        // TODO: check in section data, from which site we have a constat number of separators
        if (leftWordsEqual) firstWord = countWordsLeft ? countWordsLeft + 1 : 1;
        if (rightWordsEqual)
          firstWord = countWordsRight ? countWordsRight + 1 : 1;
        break;
      case 'right':
        firstWord = 1;
        break;
      default:
        break;
    }
  }
  if (multipleWords && position === 'right') {
    firstWord = countWordsLeft ? countWordsLeft + 1 : 0;
  }
  if (multipleWords && position === 'left') {
    firstWord = countWordsRight ? countWordsRight + 1 : 0;
  }

  return { separator, firstWord, position };
}
