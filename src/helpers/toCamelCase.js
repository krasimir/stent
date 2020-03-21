const startRe = /^[\W_]+/;
const re = /[\W_]+/g;

export default text => {
  return (
    text
      // Trim the delimiter from the start of the string
      // to ensure the starting character in the result is never capitalized
      // e.g., `-camel-case` --> 'camelCase' instead of 'CamelCase'
      .replace(startRe, "")
      .split(re)
      .reduce((result, word, idx) => {
        if (idx === 0) {
          word = word.charAt(0).toLowerCase() + word.substr(1);
        } else {
          word = word.charAt(0).toUpperCase() + word.substr(1);
        }
        result += word;
        return result;
      }, "")
  );
};
