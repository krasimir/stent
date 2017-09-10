'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createMachine = require('../createMachine');

var _createMachine2 = _interopRequireDefault(_createMachine);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the createMachine factory', function () {

  describe('when registering methods', function () {
    it('should create methods dynamically (based on states and actions)', function () {
      var machine = {};

      (0, _createMachine.registerMethods)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, sinon.spy());

      expect(_typeof(machine.isIdle)).to.be.equal('function');
      expect(_typeof(machine.isRunning)).to.be.equal('function');
      expect(_typeof(machine.run)).to.be.equal('function');
      expect(_typeof(machine.stop)).to.be.equal('function');
    });
    it('should dispatch an action with the given payload', function () {
      var dispatch = sinon.spy();
      var machine = {};
      var payload1 = { answer: 42 };
      var payload2 = 'foo';

      (0, _createMachine.registerMethods)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, dispatch);

      machine.run(payload1, payload2);

      expect(dispatch).to.be.calledOnce.and.to.be.calledWith('run', payload1, payload2);
    });
    it('should check if the machine is in a particular state', function () {
      var machine = { state: { name: 'running' } };

      (0, _createMachine.registerMethods)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, sinon.spy());

      expect(machine.isIdle()).to.be.false;
      expect(machine.isRunning()).to.be.true;
    });
  });

  describe('when validating config', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(_createMachine.validateConfig.bind(null, { transitions: {} })).to.throw(_constants.ERROR_MISSING_STATE);
      expect(_createMachine.validateConfig.bind(null, { state: {} })).to.throw(_constants.ERROR_MISSING_TRANSITIONS);
      expect((0, _createMachine.validateConfig)({ state: {}, transitions: {} })).to.equal(true);
    });
  });

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
    it('it handle the action', function () {
      var machine = (0, _createMachine2.default)({
        state: { name: 'idle' },
        transitions: {
          'idle': {
            run: function run(state, a, b) {
              return { name: 'running', data: [a, b] };
            }
          },
          'running': { stop: 'idle' }
        }
      });

      machine.run('a', 'b');
      expect(machine.state.name).to.equal('running');
      expect(machine.state.data).to.deep.equal(['a', 'b']);
    });
  });
});