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
  strToRemove: string[],
  columnName: SectionColumns,
  data: MsSection[]
) {
  let separator: string | null = null;
  let firstWord = 1;
  let position: 'left' | 'right' | 'middle' | null = null;
  if (selection?.selectionStart === 0) position = 'left';
  if (selection?.selectionEnd === preview!.length - 1) position = 'right';
  if (
    selection?.selectionStart !== 0 &&
    selection?.selectionEnd === preview!.length - 1
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
        separator = preview![selection!.selectionStart!];
        break;

      default:
        break;
    }
  }
  if (separator === null || separator === undefined) {
    throw new Error('error during separator detection');
  }

  // for middle word index find
  let rightWordsEqual = false;
  let countWordsRight: number | null | undefined = null;
  const countWordsLeft = preview
    ?.substring(0, selection.selectionEnd)
    .split(separator).length;

  const leftWordsEqual = data?.every((element) => {
    let text = element[columnName];
    if (strToRemove) {
      text = removeSubstrings(element[columnName]!, strToRemove);
    }
    return (
      text?.substring(0, selection.selectionEnd).split(separator!) ===
      countWordsLeft
    );
  });

  if (!leftWordsEqual) {
    countWordsRight = preview
      ?.substring(selection.selectionEnd, preview.length)
      .split(separator).length;

    rightWordsEqual = data?.every((element) => {
      let text = element[columnName];
      if (strToRemove) {
        text = removeSubstrings(element[columnName]!, strToRemove);
      }
      return (
        text
          ?.substring(selection.selectionEnd, preview!.length)
          .split(separator!) === countWordsRight
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

  return { separator, firstWord, position };
}
