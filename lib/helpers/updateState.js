'use strict';

exports.__esModule = true;
exports.default = updateState;

var _validateState = require('./validateState');

var _validateState2 = _interopRequireDefault(_validateState);

var _isEmptyObject = require('./isEmptyObject');

var _isEmptyObject2 = _interopRequireDefault(_isEmptyObject);

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateState(machine, state) {
  var newState;
  var oldState;

  if (typeof state === 'undefined') return;
  if (typeof state === 'string' || typeof state === 'number') {
    newState = { name: state.toString() };
  } else {
    newState = (0, _validateState2.default)(state);
  }

  if (typeof machine.transitions[newState.name] === 'undefined' || (0, _isEmptyObject2.default)(machine.transitions[newState.name])) {
    throw new Error((0, _constants.ERROR_UNCOVERED_STATE)(newState.name));
  }

  var handler = machine.transitions[machine.state.name]['_exit'];
  if (typeof handler === 'function') {
    handler.apply(machine, [machine, newState.name]);
  }

  (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_STATE_WILL_CHANGE, machine);

  oldState = machine.state;
  machine.state = newState;

  var handler = machine.transitions[newState.name]['_entry'];
  if (typeof handler === 'function') {
    handler.apply(machine, [machine, oldState.name]);
  }

  (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_PROCESS_STATE_CHANGE, machine);
}
module.exports = exports['default'];