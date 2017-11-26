'use strict';

var _handleActionLatest = require('../handleActionLatest');

var _handleActionLatest2 = _interopRequireDefault(_handleActionLatest);

var _ = require('../');

var _2 = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the handleActionLatest helper', function () {
  beforeEach(function () {
    _2.Machine.flush();
  });
  describe('and we fire same action twice within the same state', function () {
    it('should kill the first generator and its processes leaving only the new one working', function (done) {
      var handlerSpyA = sinon.spy();
      var handlerSpyB = sinon.spy();
      var timeouts = [20, 10];
      var results = ['foo', 'bar'];
      var apiPromise = function apiPromise() {
        return new Promise(function (resolve) {
          var result = results.shift();

          setTimeout(function () {
            return resolve(result);
          }, timeouts.shift());
        });
      };
      var api = /*#__PURE__*/regeneratorRuntime.mark(function api() {
        var newState;
        return regeneratorRuntime.wrap(function api$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                handlerSpyA();
                _context.next = 3;
                return (0, _.call)(apiPromise);

              case 3:
                _context.t0 = _context.sent;
                newState = {
                  name: _context.t0
                };

                handlerSpyB();
                return _context.abrupt('return', newState);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, api, this);
      });
      var handler = /*#__PURE__*/regeneratorRuntime.mark(function handler() {
        return regeneratorRuntime.wrap(function handler$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _.call)( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  return regeneratorRuntime.wrap(function _callee$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return (0, _.call)(api, 'stent');

                        case 2:
                          return _context2.abrupt('return', _context2.sent);

                        case 3:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee, this);
                }));

              case 2:
                return _context3.abrupt('return', _context3.sent);

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, handler, this);
      });
      var machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler },
          'foo': 'a',
          'bar': 'a'
        }
      };

      (0, _handleActionLatest2.default)(machine, 'run');
      (0, _handleActionLatest2.default)(machine, 'run');

      setTimeout(function () {
        expect(handlerSpyA).to.be.calledTwice;
        expect(handlerSpyB).to.be.calledOnce;
        expect(machine.state.name).to.equal('bar');
        done();
      }, 31);
    });
  });
});