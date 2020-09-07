const parse: PraserFunc = (value, options) => {
  if (value !== null) {
    const { separator, firstWord, fromRight, strToRemove } = options;
    let text = value;
    if (strToRemove && strToRemove?.length > 0) {
      strToRemove.forEach((pattern) => {
        text = text.replaceAll(pattern, '').trim();
      });
    }

    const howManyWords =
      options.howManyWords && options.howManyWords > 0
        ? options.howManyWords
        : 1;
    const words = text.split(separator);
    const pickedWords = [];

    if (fromRight) {
      const firstWordIndex = words.length - firstWord;
      for (let i = 0; i < howManyWords; i += 1) {
        pickedWords.push(words[firstWordIndex - i]);
      }
      return pickedWords.reverse().join(' ').trim();
    }

    for (let i = 0; i < howManyWords; i += 1) {
      pickedWords.push(words[firstWord - 1 + i]);
    }

    return pickedWords.join(' ').trim();
  }
  return '';
};

export default parse;
