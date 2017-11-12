import createMachine from '../createMachine';
import { ERROR_MISSING_STATE, ERROR_MISSING_TRANSITIONS } from '../constants';

describe('Given the createMachine factory', function () {

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

  describe('when we create a machine using the shorter syntax', function () {
    it('it should create a working machine', function () {
      const machine = createMachine(
        { name: 'idle' },
        {
          'idle': {
            'run': 'running'
          },
          'running': {
            'stop': 'idle'
          }
        }
      );

      machine.run();
      expect(machine.state.name).to.equal('running');
      machine.stop();
      expect(machine.state.name).to.equal('idle');
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