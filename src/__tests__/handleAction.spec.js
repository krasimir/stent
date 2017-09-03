import handleAction from '../handleAction';
import { ERROR_MISSING_ACTION_IN_STATE } from '../constants';

describe.only('Given the handleAction function', function () {

  describe('when dispatching an action which is missing in the current state', function () {
    it('should throw an error', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'foo' }
        }
      };

      expect(handleAction.bind(null, machine, 'stop'))
        .to.throw(ERROR_MISSING_ACTION_IN_STATE('stop', 'idle'));
    });
  });

  describe('when there is nothing for the current state', function () {
    it('should return false', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          foo: {}
        }
      };

      expect(handleAction(machine, 'something')).to.be.false;
    });
  });

  describe('when the handler is a string', function () {
    it('should change the state of the machine to that string', function () {
      const machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: 'running' }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
  });

  describe('when the handler is a function', function () {
    it('should call the handler with the current state and the given payload', function () {
      const handler = sinon.spy();
      const payload = 'foo';
      const machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: handler }
        }
      };

      handleAction(machine, 'run', payload);
      expect(handler).to.be.calledOnce.and.to.be.calledWith({ name: 'foo'}, payload);
    });
  });

});