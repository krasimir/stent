'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// errors
var ERROR_MISSING_MACHINE = exports.ERROR_MISSING_MACHINE = function ERROR_MISSING_MACHINE(name) {
  return 'There\'s no machine with name ' + name;
};
var ERROR_MISSING_STATE = exports.ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
var ERROR_MISSING_TRANSITIONS = exports.ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
var ERROR_WRONG_STATE_FORMAT = exports.ERROR_WRONG_STATE_FORMAT = function ERROR_WRONG_STATE_FORMAT(state) {
  var serialized = (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' ? JSON.stringify(state, null, 2) : state;

  return 'The state should be an object and it should always have at least "name" property. You passed ' + serialized;
};
var ERROR_UNCOVERED_STATE = exports.ERROR_UNCOVERED_STATE = function ERROR_UNCOVERED_STATE(state) {
  return 'You just transitioned the machine to a state (' + state + ') which is not defined or it has no actions. This means that the machine is stuck.';
};
var ERROR_NOT_SUPPORTED_HANDLER_TYPE = exports.ERROR_NOT_SUPPORTED_HANDLER_TYPE = 'Wrong handler type passed. Please read the docs https://github.com/krasimir/stent';

// middlewares
var MIDDLEWARE_PROCESS_ACTION = exports.MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
var MIDDLEWARE_ACTION_PROCESSED = exports.MIDDLEWARE_ACTION_PROCESSED = 'onActionProcessed';
var MIDDLEWARE_STATE_WILL_CHANGE = exports.MIDDLEWARE_STATE_WILL_CHANGE = 'onStateWillChange';
var MIDDLEWARE_PROCESS_STATE_CHANGE = exports.MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
var MIDDLEWARE_GENERATOR_STEP = exports.MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';
var MIDDLEWARE_MACHINE_CREATED = exports.MIDDLEWARE_MACHINE_CREATED = 'onMachineCreated';
var MIDDLEWARE_MACHINE_CONNECTED = exports.MIDDLEWARE_MACHINE_CONNECTED = 'onMachineConnected';
var MIDDLEWARE_MACHINE_DISCONNECTED = exports.MIDDLEWARE_MACHINE_DISCONNECTED = 'onMachineDisconnected';

// misc
var DEVTOOLS_KEY = exports.DEVTOOLS_KEY = '__hello__stent__';