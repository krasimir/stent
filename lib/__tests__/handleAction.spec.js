'use strict';

var _handleAction = require('../handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the handleAction function', function () {

  describe('when dispatching an action which is missing in the current state', function () {
    it('should throw an error', function () {
      var machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'foo' }
        }
      };

      expect(_handleAction2.default.bind(null, machine, 'stop')).to.throw((0, _constants.ERROR_MISSING_ACTION_IN_STATE)('stop', 'idle'));
    });
  });

  describe('when there is nothing for the current state', function () {
    it('should return false', function () {
      var machine = {
        state: { name: 'idle' },
        transitions: {
          foo: {}
        }
      };

      expect((0, _handleAction2.default)(machine, 'something')).to.be.false;
    });
  });

  // describe('when the state is invalid', function () {
  //   it('should throw an error', function () {
  //     ...
  //   });
  // });

  describe('when the handler is a string', function () {
    it('should change the state of the machine to that string', function () {
      var machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: 'running' }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
  });

  describe('when the handler is an object', function () {
    it('should change the state of the machine to that object', function () {
      var newState = { name: 'running', answer: 42 };
      var machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: newState }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state).to.deep.equal(newState);
    });
  });

  describe('when the handler is a function', function () {
    it('should call the handler with the current state and the given payload', function () {
      var handler = sinon.spy();
      var payload = 'foo';
      var machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run', payload);
      expect(handler).to.be.calledOnce.and.to.be.calledWith({ name: 'foo' }, payload);
    });
    it('should update the state', function () {
      var handler = function handler(state, payload) {
        return { name: 'bar', data: payload };
      };
      var machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run', 42);
      expect(machine.state).to.deep.equal({ name: 'bar', data: 42 });
    });
    it('should update the state even if a string is returned', function () {
      var handler = function handler(state, payload) {
        return 'new-state';
      };
      var machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state).to.deep.equal({ name: 'new-state' });
    });
    it('should run the handler with the machine as a context', function () {
      var handler = function handler() {
        expect(this.state).to.deep.equal({ name: 'idle', data: 42 });
        return 'foo';
      };
      var machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
    });
  });

  describe('when the handler is a generator', function () {
    it('should change the state if we return a string', function () {
      var handler = /*#__PURE__*/regeneratorRuntime.mark(function handler() {
        return regeneratorRuntime.wrap(function handler$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return 'foo';

              case 2:
                _context.next = 4;
                return 'bar';

              case 4:
                return _context.abrupt('return', 'running');

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, handler, this);
      });
      var machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
    it('should change the state if we yield a string', function () {
      var handler = /*#__PURE__*/regeneratorRuntime.mark(function handler() {
        return regeneratorRuntime.wrap(function handler$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return 'running';

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, handler, this);
      });
      var machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
    it('should change the state if we yield an object', function () {
      var handler = /*#__PURE__*/regeneratorRuntime.mark(function handler() {
        return regeneratorRuntime.wrap(function handler$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return { name: 'running', data: 12 };

              case 2:
                _context3.next = 4;
                return { name: 'jumping', data: 1 };

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, handler, this);
      });
      var machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      (0, _handleAction2.default)(machine, 'run');
      expect(machine.state).to.deep.equal({ name: 'jumping', data: 1 });
    });
  });
});