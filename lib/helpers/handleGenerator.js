'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleGenerator;

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

var _updateState = require('./updateState');

var _updateState2 = _interopRequireDefault(_updateState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var generatorNext = function generatorNext(gen, res) {
    if (canceled) return;
    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_RESUMED, machine, res);
    return gen.next(res);
  };
  var generatorThrow = function generatorThrow(gen, error) {
    return !canceled && gen.throw(error);
  };
  var cancelGenerator = function cancelGenerator() {
    cancelInsideGenerator && cancelInsideGenerator();
    canceled = true;
  };
  var canceled = false;
  var cancelInsideGenerator;

  var iterate = function iterate(result) {
    if (canceled) return;

    if (!result.done) {
      (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_STEP, machine, result.value);

      // yield call
      if (_typeof(result.value) === 'object' && result.value.__type === 'call') {
        var _result$value = result.value,
            func = _result$value.func,
            args = _result$value.args;

        var funcResult = func.apply(machine, args);

        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(function (result) {
            return iterate(generatorNext(generator, result));
          }, function (error) {
            return iterate(generatorThrow(generator, error));
          });
          // generator
        } else if (typeof funcResult.next === 'function') {
          cancelInsideGenerator = handleGenerator(machine, funcResult, function (generatorResult) {
            iterate(generatorNext(generator, generatorResult));
          });
        } else {
          iterate(generatorNext(generator, funcResult));
        }

        // a return statement of the normal function
      } else {
        (0, _updateState2.default)(machine, result.value);
        iterate(generatorNext(generator));
      }

      // the end of the generator (return statement)
    } else {
      (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_END, machine, result.value);
      done(result.value);
    }
  };

  iterate(generatorNext(generator, resultOfPreviousOperation));

  return cancelGenerator;
}
module.exports = exports['default'];