'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.registerMethods = registerMethods;
exports.validateConfig = validateConfig;
exports.default = createMachine;

var _toCamelCase = require('./helpers/toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

var _constants = require('./constants');

var _handleAction = require('./handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerMethods(machine, transitions, dispatch) {
  for (var state in transitions) {

    (function (state) {
      machine[(0, _toCamelCase2.default)('is ' + state)] = function () {
        return machine.state.name === state;
      };
    })(state);

    for (var action in transitions[state]) {
      (function (action) {
        machine[(0, _toCamelCase2.default)(action)] = function (payload) {
          return dispatch(action, payload);
        };
      })(action);
    }
  }
}

function validateConfig(_ref) {
  var state = _ref.state,
      transitions = _ref.transitions;

  if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object') throw new Error(_constants.ERROR_MISSING_STATE);
  if ((typeof transitions === 'undefined' ? 'undefined' : _typeof(transitions)) !== 'object') throw new Error(_constants.ERROR_MISSING_TRANSITIONS);
  return true;
}

function createMachine(name, config, middlewares) {
  var _machine;

  var machine = (_machine = {
    name: name
  }, _machine[_constants.MIDDLEWARE_STORAGE] = middlewares, _machine);
  var initialState = config.state,
      transitions = config.transitions;


  machine.state = initialState;
  machine.transitions = transitions;

  if (validateConfig(config)) {
    registerMethods(machine, transitions, function (action) {
      for (var _len = arguments.length, payload = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        payload[_key - 1] = arguments[_key];
      }

      return _handleAction2.default.apply(undefined, [machine, action].concat(payload));
    });
  }

  return machine;
}