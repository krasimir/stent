'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleAction;

var _constants = require('./constants');

var _validateState = require('./helpers/validateState');

var _validateState2 = _interopRequireDefault(_validateState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var iterate = function iterate(result) {
    if (!result.done) {

      // yield call
      if (_typeof(result.value) === 'object' && result.value.__type === 'call') {
        var _result$value;

        var funcResult = (_result$value = result.value).func.apply(_result$value, result.value.args);

        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(function (r) {
            return iterate(generator.next(r));
          }, function (error) {
            return iterate(generator.throw(new Error(error)));
          });
          // generator
        } else if (typeof funcResult.next === 'function') {
          handleGenerator(machine, funcResult, function (generatorResult) {
            iterate(generator.next(generatorResult));
          });
        } else {
          iterate(generator.next(funcResult));
        }

        // the return statement of the normal function
      } else {
        updateState(machine, result.value);
        iterate(generator.next());
      }

      // the end of the generator (return statement)
    } else {
      done(result.value);
    }
  };

  iterate(generator.next(resultOfPreviousOperation));
}

function updateState(machine, response) {
  if (typeof response === 'undefined') return;
  if (typeof response === 'string' || typeof response === 'number') {
    machine.state = { name: response.toString() };
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
      handleGenerator(machine, response, function (response) {
        updateState(machine, response);
      });
    } else {
      updateState(machine, response);
    }
  }

  return true;
};
module.exports = exports['default'];