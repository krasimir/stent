'use strict';

var _connect = require('../connect');

var _connect2 = _interopRequireDefault(_connect);

var _call = require('../generators/call');

var _call2 = _interopRequireDefault(_call);

var _ = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IDLE = 'IDLE';
var END = 'END';
var FAILURE = 'FAILURE';

var makeState = function makeState() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'INVALID';
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return { name: name, error: error };
};

describe('Given the call helper', function () {
  beforeEach(function () {
    _.Machine.flush();
  });
  describe('when calling it with a non-function argument', function () {
    it('should catch the error and transition to Failure state with a meaningful error message', function (done) {
      var _transitions;

      var missingFunc = undefined;
      var errMessage = "The argument passed to `call` is falsy (undefined)";

      var machine = _.Machine.create('A', {
        state: makeState(IDLE),
        transitions: (_transitions = {}, _transitions[IDLE] = {
          run: /*#__PURE__*/regeneratorRuntime.mark(function run() {
            return regeneratorRuntime.wrap(function run$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return (0, _call2.default)(missingFunc);

                  case 3:
                    _context.next = 5;
                    return makeState(END);

                  case 5:
                    _context.next = 11;
                    break;

                  case 7:
                    _context.prev = 7;
                    _context.t0 = _context['catch'](0);
                    _context.next = 11;
                    return makeState(FAILURE, _context.t0);

                  case 11:
                  case 'end':
                    return _context.stop();
                }
              }
            }, run, this, [[0, 7]]);
          })
        }, _transitions[END] = {
          reload: makeState(IDLE)
        }, _transitions[FAILURE] = {
          reload: makeState(IDLE)
        }, _transitions)
      });

      (0, _connect2.default)().with('A').mapSilent(function (A) {
        expect(A.state.name).to.equal(FAILURE);
        expect(A.state.error.message).to.equal(errMessage);
        done();
      });

      machine.run();
    });
  });
});