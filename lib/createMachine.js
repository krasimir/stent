'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = createMachine;

var _handleAction = require('./helpers/handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

var _handleActionLatest = require('./helpers/handleActionLatest');

var _handleActionLatest2 = _interopRequireDefault(_handleActionLatest);

var _validateConfig = require('./helpers/validateConfig');

var _validateConfig2 = _interopRequireDefault(_validateConfig);

var _registerMethods = require('./helpers/registerMethods');

var _registerMethods2 = _interopRequireDefault(_registerMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var IDX = 0;
var getMachineID = function getMachineID() {
  return '_@@@' + ++IDX;
};

function createMachine(name, config) {
  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    if (typeof config === 'undefined') {
      config = name;
      name = getMachineID();
    } else {
      config = {
        state: name,
        transitions: config
      };
      name = getMachineID();
    }
  }

  var machine = { name: name };

  (0, _validateConfig2.default)(config);

  var _config = config,
      initialState = _config.state,
      transitions = _config.transitions,
      customMethods = _objectWithoutProperties(_config, ['state', 'transitions']);

  var dispatch = function dispatch(action) {
    for (var _len = arguments.length, payload = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      payload[_key - 1] = arguments[_key];
    }

    return _handleAction2.default.apply(undefined, [machine, action].concat(payload));
  };
  var dispatchLatest = function dispatchLatest(action) {
    for (var _len2 = arguments.length, payload = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      payload[_key2 - 1] = arguments[_key2];
    }

    return _handleActionLatest2.default.apply(undefined, [machine, action].concat(payload));
  };

  machine.state = initialState;
  machine.transitions = transitions;

  if (customMethods) {
    for (var key in customMethods) {
      machine[key] = customMethods[key];
    }
  }

  (0, _registerMethods2.default)(machine, transitions, dispatch, dispatchLatest);

  return machine;
}
module.exports = exports['default'];