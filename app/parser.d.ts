type PraserFunc = (
  value: string | null,
  options: {
    separator: string;
    firstWord: number;
    fromRight?: boolean;
    howManyWords?: number;
    strToRemove?: string[];
  }
) => string;
