'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = validateState;

var _constants = require('../constants');

function validateState(state) {
  if (state && (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' && typeof state.name !== 'undefined') return state;
  throw new Error((0, _constants.ERROR_WRONG_STATE_FORMAT)(state));
}
module.exports = exports['default'];