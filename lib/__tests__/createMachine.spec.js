'use strict';

var _createMachine = require('../createMachine');

var _createMachine2 = _interopRequireDefault(_createMachine);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the createMachine factory', function () {

  describe('when passing invalid configuration', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(_createMachine2.default.bind(null)).to.throw(_constants.ERROR_MISSING_STATE);
    });
  });

  describe('when we create a machine without a name', function () {
    it('it should automatically generate a name and allow the creation', function () {
      var machine = (0, _createMachine2.default)({
        state: { name: 'idle' },
        transitions: { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }
      });

      expect(machine.isIdle()).to.equal(true);
      machine.run();
      expect(machine.isRunning()).to.equal(true);
    });
  });

  describe('when we create a machine without a state', function () {
    it('it should throw an error', function () {
      expect(_createMachine2.default.bind(null)).to.throw(_constants.ERROR_MISSING_STATE);
    });
  });

  describe('when we create a machine using the shorter syntax', function () {
    it('it should create a working machine', function () {
      var machine = (0, _createMachine2.default)({ name: 'idle' }, {
        'idle': {
          'run': 'running'
        },
        'running': {
          'stop': 'idle'
        }
      });

      machine.run();
      expect(machine.state.name).to.equal('running');
      machine.stop();
      expect(machine.state.name).to.equal('idle');
    });
  });

  describe('when we dispatch an action', function () {
    it('it should handle the action', function () {
      var machine = (0, _createMachine2.default)({
        state: { name: 'idle' },
        transitions: {
          'idle': {
            'run baby run': function runBabyRun(machine, a, b) {
              return { name: 'running', data: [a, b] };
            }
          },
          'running': { stop: 'idle' }
        }
      });

      machine.runBabyRun('a', 'b');
      expect(machine.state.name).to.equal('running');
      expect(machine.state.data).to.deep.equal(['a', 'b']);
    });
    it('it should handle the action implemented as arrow function', function () {
      var machine = (0, _createMachine2.default)({
        state: { name: 'idle' },
        transitions: {
          'idle': {
            'run baby run': function runBabyRun(machine, a, b) {
              return {
                name: 'running',
                data: [a, b]
              };
            }
          },
          'running': { stop: 'idle' }
        }
      });

      machine.runBabyRun('a', 'b');
      expect(machine.state.name).to.equal('running');
      expect(machine.state.data).to.deep.equal(['a', 'b']);
    });
  });
});