'use strict';

var _ = require('../../');

var _2 = require('../');

var _helpers = require('../../helpers');

describe('Given the Logger middleware', function () {
  beforeEach(function () {
    sinon.stub(console, 'log');
    _.Machine.addMiddleware(_2.Logger);
  });
  afterEach(function () {
    console.log.restore();
    _.Machine.flush();
  });
  describe('when using Logger with function and string as a handler', function () {
    it('should log to the console', function () {
      var machine = _.Machine.create({ name: 'idle' }, {
        idle: {
          run: function run() {
            return 'running';
          }
        },
        running: {
          stop: 'idle'
        }
      });

      machine.run({}, 42, 'hello world');
      machine.stop();

      expect(console.log.callCount).to.be.equal(4);
      [machine.name + ': "run" dispatched with payload [object Object],42,hello world', machine.name + ': state changed to "running"', machine.name + ': "stop" dispatched', machine.name + ': state changed to "idle"'].forEach(function (logStr, i) {
        expect(console.log.getCall(i)).to.be.calledWith(logStr);
      });
    });
  });
  describe('when using the Logger with a generator function', function () {
    it('should log every step of the generator', function () {
      var myFunc = function myFunc() {
        return { name: 'running' };
      };
      var machine = _.Machine.create({ name: 'idle' }, {
        idle: {
          run: /*#__PURE__*/regeneratorRuntime.mark(function run() {
            return regeneratorRuntime.wrap(function run$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return 'running';

                  case 2:
                    _context.next = 4;
                    return { name: 'running' };

                  case 4:
                    _context.next = 6;
                    return (0, _helpers.call)(myFunc, 42);

                  case 6:
                    return _context.abrupt('return', 'running');

                  case 7:
                  case 'end':
                    return _context.stop();
                }
              }
            }, run, this);
          })
        },
        running: {
          stop: 'idle'
        }
      });

      machine.run({ foo: 'bar' }, 42, 'hello world');
      machine.stop();

      expect(console.log.callCount).to.be.equal(10);
      [machine.name + ': "run" dispatched with payload [object Object],42,hello world', machine.name + ': generator step -> running', machine.name + ': state changed to "running"', machine.name + ': generator step -> [object Object]', machine.name + ': state changed to "running"', machine.name + ': generator step -> [object Object]', machine.name + ': generator step -> running', machine.name + ': state changed to "running"', machine.name + ': "stop" dispatched', machine.name + ': state changed to "idle"'].forEach(function (logStr, i) {
        expect(console.log.getCall(i)).to.be.calledWith(logStr);
      });
    });
  });
});