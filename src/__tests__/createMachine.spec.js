import createMachine from '../createMachine';
import { registerMethods, validateConfig } from '../createMachine';
import { ERROR_MISSING_STATE, ERROR_MISSING_TRANSITIONS } from '../constants';

describe('Given the createMachine factory', function () {

  describe('when registering methods', function () {
    it('should create methods dynamically (based on states and actions)', function () {
      const machine = {};

      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        sinon.spy()
      );
      
      expect(typeof machine.isIdle).to.be.equal('function');
      expect(typeof machine.isRunning).to.be.equal('function');
      expect(typeof machine.run).to.be.equal('function');
      expect(typeof machine.stop).to.be.equal('function');
    });
    it('should dispatch an action with the given payload', function () {
      const dispatch = sinon.spy();
      const machine = {};
      const payload1 = { answer: 42 };
      const payload2 = 'foo'
  
      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        dispatch
      );
      
      machine.run(payload1, payload2);

      expect(dispatch).to.be.calledOnce.and.to.be.calledWith('run', payload1, payload2);
    });
    it('should check if the machine is in a particular state', function () {
      const machine = { state: { name: 'running' }};
  
      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        sinon.spy()
      );

      expect(machine.isIdle()).to.be.false;
      expect(machine.isRunning()).to.be.true;
    });
  });

  describe('when validating config', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(validateConfig.bind(null, { transitions: {} })).to.throw(ERROR_MISSING_STATE);
      expect(validateConfig.bind(null, { state: {} })).to.throw(ERROR_MISSING_TRANSITIONS);
      expect(validateConfig({ state: {}, transitions: {} })).to.equal(true);
    });
  });

  describe('when passing invalid configuration', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(createMachine.bind(null)).to.throw(ERROR_MISSING_STATE);
    });
  });

  describe('when we create a machine without a name', function () {
    it('it should automatically generate a name and allow the creation', function () {
      const machine = createMachine({
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
      expect(createMachine.bind(null)).to.throw(ERROR_MISSING_STATE);
    });
  });

  describe('when we dispatch an action', function () {
    it('it handle the action', function () {
      const machine = createMachine({
        state: { name: 'idle' },
        transitions: {
          'idle': {
            run: function (state, a, b) {
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