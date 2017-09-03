'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleAction;

var _constants = require('./constants');

var _validateState = require('./helpers/validateState');

var _validateState2 = _interopRequireDefault(_validateState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleGenerator(machine, generator) {
  var result = generator.next();

  if (!result.done) {
    updateState(machine, result.value);
    return handleGenerator(machine, generator);
  }
  return result.value;
}

function updateState(machine, response) {
  if (typeof response === 'undefined') return;
  if (typeof response === 'string') {
    machine.state = { name: response };
  } else {
    machine.state = (0, _validateState2.default)(response);
  }
}

function handleAction(machine, action, payload) {
  var state = machine.state,
      transitions = machine.transitions;


  if (!transitions[state.name]) {
    return false;
  }

  var handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    throw new Error((0, _constants.ERROR_MISSING_ACTION_IN_STATE)(action, state.name));
  }

  // string as a handler
  if (typeof handler === 'string') {
    state.name = transitions[state.name][action];

    // object as a handler
  } else if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
    machine.state = (0, _validateState2.default)(handler);

    // function as a handler
  } else if (typeof handler === 'function') {
    var response = transitions[state.name][action].apply(machine, [machine.state, payload]);

    if (response && typeof response.next === 'function') {
      response = handleGenerator(machine, response);
    }

    updateState(machine, response);
  }

  return true;
};
module.exports = exports['default'];