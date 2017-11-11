'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleAction;

var _constants = require('./constants');

var _validateState = require('./helpers/validateState');

var _validateState2 = _interopRequireDefault(_validateState);

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
var MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
var MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var iterate = function iterate(result) {
    handleMiddleware(function () {
      if (!result.done) {

        // yield call
        if (_typeof(result.value) === 'object' && result.value.__type === 'call') {
          var _result$value = result.value,
              func = _result$value.func,
              args = _result$value.args;

          var funcResult = func.apply(machine, args);

          // promise
          if (typeof funcResult.then !== 'undefined') {
            funcResult.then(function (result) {
              return iterate(generator.next(result));
            }, function (error) {
              return iterate(generator.throw(error));
            });
            // generator
          } else if (typeof funcResult.next === 'function') {
            handleGenerator(machine, funcResult, function (generatorResult) {
              iterate(generator.next(generatorResult));
            });
          } else {
            iterate(generator.next(funcResult));
          }

          // a return statement of the normal function
        } else {
          updateState(machine, result.value);
          iterate(generator.next());
        }

        // the end of the generator (return statement)
      } else {
        done(result.value);
      }
    }, MIDDLEWARE_GENERATOR_STEP, machine, result.value);
  };

  iterate(generator.next(resultOfPreviousOperation));
}

function updateState(machine, response) {
  var newState;

  if (typeof response === 'undefined') return;
  if (typeof response === 'string' || typeof response === 'number') {
    newState = { name: response.toString() };
  } else {
    newState = (0, _validateState2.default)(response);
  }

  if (typeof machine.transitions[newState.name] === 'undefined' || isEmptyObject(machine.transitions[newState.name])) {
    throw new Error((0, _constants.ERROR_UNCOVERED_STATE)(newState.name));
  }

  handleMiddleware(function () {
    machine.state = newState;
  }, MIDDLEWARE_PROCESS_STATE_CHANGE, machine);
}

function handleMiddleware(done, hook, machine) {
  for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var middlewares = _.Machine.middlewares;

  if (middlewares.length === 0) return done();

  var loop = function loop(index, process) {
    return index < middlewares.length - 1 ? process(index + 1) : done();
  };

  (function process(index) {
    var middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, [function () {
        return loop(index, process);
      }].concat(args));
    } else {
      loop(index, process);
    }
  })(0);
}

function handleAction(machine, action) {
  for (var _len2 = arguments.length, payload = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    payload[_key2 - 2] = arguments[_key2];
  }

  var state = machine.state,
      transitions = machine.transitions;


  if (!transitions[state.name]) {
    return false;
  }

  var handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    return false;
  }

  handleMiddleware.apply(undefined, [function () {
    // string as a handler
    if (typeof handler === 'string') {
      updateState(machine, _extends({}, state, { name: transitions[state.name][action] }));

      // object as a handler
    } else if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
      updateState(machine, (0, _validateState2.default)(handler));

      // function as a handler
    } else if (typeof handler === 'function') {
      var response = transitions[state.name][action].apply(machine, [machine.state].concat(payload));

      if (response && typeof response.next === 'function') {
        handleGenerator(machine, response, function (response) {
          updateState(machine, response);
        });
      } else {
        updateState(machine, response);
      }

      // wrong type of handler
    } else {
      throw new Error(_constants.ERROR_NOT_SUPPORTED_HANDLER_TYPE);
    }
  }, MIDDLEWARE_PROCESS_ACTION, machine, action].concat(payload));

  return true;
};
module.exports = exports['default'];