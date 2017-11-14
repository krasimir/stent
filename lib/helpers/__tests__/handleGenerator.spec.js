'use strict';

var _handleGenerator = require('../handleGenerator');

var _handleGenerator2 = _interopRequireDefault(_handleGenerator);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the handleGenerator helper', function () {
  describe('when we run the same generator again', function () {
    describe('and we want to cancel the first one', function () {
      it('should cancel the second generator', function (done) {
        var testCases = [{ timeout: 20, answer: 'a' }, { timeout: 10, answer: 'b' }];
        var delay = function delay(_ref) {
          var timeout = _ref.timeout,
              answer = _ref.answer;
          return new Promise(function (resolve) {
            setTimeout(function () {
              return resolve(answer);
            }, timeout);
          });
        };
        var onGeneratorEnds = sinon.spy();
        var generator = /*#__PURE__*/regeneratorRuntime.mark(function generator() {
          return regeneratorRuntime.wrap(function generator$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return (0, _.call)( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return (0, _.call)(function () {
                              return delay(testCases.shift());
                            });

                          case 2:
                            return _context.abrupt('return', _context.sent);

                          case 3:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                case 2:
                  return _context2.abrupt('return', _context2.sent);

                case 3:
                case 'end':
                  return _context2.stop();
              }
            }
          }, generator, this);
        });

        var cancel = (0, _handleGenerator2.default)({}, generator(), onGeneratorEnds);
        (0, _handleGenerator2.default)({}, generator(), onGeneratorEnds);
        cancel();

        setTimeout(function () {
          expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('b');
          done();
        }, 30);
      });
    });
  });
});