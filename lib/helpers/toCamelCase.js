"use strict";

exports.__esModule = true;
var startRe = /^[\W_]+/;
var re = /[\W_]+/g;

exports.default = function (text) {
  return text
  // Trim the delimiter from the start of the string
  // to ensure the starting character in the result is never capitalized
  // e.g., `-camel-case` --> 'camelCase' instead of 'CamelCase'
  .replace(startRe, "").split(re).reduce(function (result, word, idx) {
    if (idx === 0) {
      word = word.charAt(0).toLowerCase() + word.substr(1);
    } else {
      word = word.charAt(0).toUpperCase() + word.substr(1);
    }
    result += word;
    return result;
  }, "");
};

module.exports = exports['default'];