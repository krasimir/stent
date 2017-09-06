'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// errors
var ERROR_MISSING_MACHINE = exports.ERROR_MISSING_MACHINE = function ERROR_MISSING_MACHINE(name) {
  return 'There\'s no machine with name ' + name;
};
var ERROR_MISSING_STATE = exports.ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
var ERROR_MISSING_TRANSITIONS = exports.ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
var ERROR_MISSING_ACTION_IN_STATE = exports.ERROR_MISSING_ACTION_IN_STATE = function ERROR_MISSING_ACTION_IN_STATE(action, state) {
  return '"' + action + '" action is not available in "' + state + '" state';
};
var ERROR_WRONG_STATE_FORMAT = exports.ERROR_WRONG_STATE_FORMAT = function ERROR_WRONG_STATE_FORMAT(state) {
  var serialized = (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' ? JSON.stringify(state, null, 2) : state;

  return 'The state should be an object and it should always have at least "name" property. You passed ' + serialized;
};
var ERROR_UNCOVERED_STATE = exports.ERROR_UNCOVERED_STATE = function ERROR_UNCOVERED_STATE(state) {
  return 'You just transitioned the machine to a state (' + state + ') which is not defined or it has no actions. This means that the machine is stuck.';
};

// other
var WAIT_LISTENERS_STORAGE = exports.WAIT_LISTENERS_STORAGE = '___@wait';
var MIDDLEWARE_STORAGE = exports.MIDDLEWARE_STORAGE = '___@middlewares';