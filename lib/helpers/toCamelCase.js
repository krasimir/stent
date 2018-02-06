'use strict';

exports.__esModule = true;

exports.default = function (text) {
  return text.split(/\W+/g).reduce(function (result, word, idx) {
    if (idx === 0) {
      word = word.charAt(0).toLowerCase() + word.substr(1);
    } else {
      word = word.charAt(0).toUpperCase() + word.substr(1);
    }
    result += word;
    return result;
  }, '');
};

module.exports = exports['default'];