"use strict";

exports.__esModule = true;
exports.default = isEmptyObject;
function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}
module.exports = exports['default'];