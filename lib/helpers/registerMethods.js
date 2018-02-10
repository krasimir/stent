'use strict';

exports.__esModule = true;
exports.default = registerMethods;

var _toCamelCase = require('./toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reserved = ['name', 'transitions', 'state', 'destroy'];

function registerMethods(machine, transitions, dispatch, dispatchLatest) {
  for (var state in transitions) {

    (function (state) {
      machine[(0, _toCamelCase2.default)('is ' + state)] = function () {
        return machine.state.name === state;
      };
    })(state);

    for (var action in transitions[state]) {
      var normalized = (0, _toCamelCase2.default)(action);
      var normalizedAllowed = (0, _toCamelCase2.default)('is ' + action + ' allowed');
      if (reserved.indexOf(normalized) >= 0) {
        throw new Error((0, _constants.ERROR_RESERVED_WORD_USED_AS_ACTION)(normalized));
      }
      (function (n, na, a) {
        machine[n] = function () {
          for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return dispatch.apply(undefined, [a].concat(payload));
        };
        machine[n].latest = function () {
          for (var _len2 = arguments.length, payload = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return dispatchLatest.apply(undefined, [a].concat(payload));
        };
        machine[na] = function () {
          return !transitions[machine.state.name] || typeof transitions[machine.state.name][a] !== 'undefined';
        };
      })(normalized, normalizedAllowed, action);
    }
  }
}
module.exports = exports['default'];