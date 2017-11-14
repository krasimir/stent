'use strict';

exports.__esModule = true;
exports.default = registerMethods;

var _toCamelCase = require('./toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerMethods(machine, transitions, dispatch, dispatchLatest) {
  for (var state in transitions) {

    (function (state) {
      machine[(0, _toCamelCase2.default)('is ' + state)] = function () {
        return machine.state.name === state;
      };
    })(state);

    for (var action in transitions[state]) {
      (function (action) {
        machine[(0, _toCamelCase2.default)(action)] = function () {
          for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return dispatch.apply(undefined, [action].concat(payload));
        };
        machine[(0, _toCamelCase2.default)(action)].latest = function () {
          for (var _len2 = arguments.length, payload = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return dispatchLatest.apply(undefined, [action].concat(payload));
        };
      })(action);
    }
  }
}
module.exports = exports['default'];