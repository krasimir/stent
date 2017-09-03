"use strict";

exports.__esModule = true;

exports.default = function (text) {
  return text.toLowerCase().replace(/\W+(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
};

module.exports = exports['default'];