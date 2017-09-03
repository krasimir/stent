'use strict';

exports.__esModule = true;
exports.default = call;
function call(func) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return { __type: 'call', func: func, args: args };
};
module.exports = exports['default'];