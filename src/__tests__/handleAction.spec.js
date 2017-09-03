import handleAction from '../handleAction';
import { ERROR_MISSING_ACTION_IN_STATE } from '../constants';

describe('Given the handleAction function', function () {

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

  // describe('when the state is invalid', function () {
  //   it('should throw an error', function () {
  //     ...
  //   });
  // });

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

  describe('when the handler is an object', function () {
    it('should change the state of the machine to that object', function () {
      const newState = { name: 'running', answer: 42 };
      const machine = {
        state: { name: 'foo' },
        transitions: {
          foo: { run: newState }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state).to.deep.equal(newState);
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
    it('should update the state', function () {
      const handler = (state, payload) => ({ name: 'bar', data: payload });
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run', 42);
      expect(machine.state).to.deep.equal({ name: 'bar', data: 42 });
    });
    it('should update the state even if a string is returned', function () {
      const handler = (state, payload) => 'new-state';
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state).to.deep.equal({ name: 'new-state' });
    });
    it('should run the handler with the machine as a context', function () {
      const handler = function () {
        expect(this.state).to.deep.equal({ name: 'idle', data: 42 });
        return 'foo';
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
    });
  });

  describe('when the handler is a generator', function () {
    it('should change the state if we return a string', function () {
      const handler = function * () {
        yield 'foo';
        yield 'bar';
        return 'running';
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
    it('should change the state if we yield a string', function () {
      const handler = function * () {
        yield 'running';
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state.name).to.equal('running');
    });
    it('should change the state if we yield an object', function () {
      const handler = function * () {
        yield { name: 'running', data: 12 };
        yield { name: 'jumping', data: 1 };
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state).to.deep.equal({ name: 'jumping', data: 1 });
    });
  });

});