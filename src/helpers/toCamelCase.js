export default text => text
  .toLowerCase()
  .replace(
    /\W+(.)/g,
    (match, chr) => chr.toUpperCase()
  );