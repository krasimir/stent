import handleAction from '../handleAction';
import { ERROR_MISSING_ACTION_IN_STATE } from '../constants';
import { call } from '../helpers';

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

  describe.skip('when we transition to a state which has no actions inside or it is not defined', function () {
    it('should throw an error', function () {
      // ...
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
    it('should change the state if we yield a primitive', function () {
      const handler = function * () {
        yield 100;
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state.name).to.equal('100');
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
    
    describe('and we use the call helper', function () {
      it('should execute the function and return the result', function () {
        const api = function(name) {
          return `hello ${ name }`;
        }
        const handler = function * () {
          const newState = yield call(api, 'stent');

          return newState;
        }
        const machine = {
          state: { name: 'idle', data: 42 },
          transitions: {
            idle: { run: handler }
          }
        };
  
        handleAction(machine, 'run');
        expect(machine.state).to.deep.equal({ name: 'hello stent' });
      });
      describe('and when the function returns a promise', function () {
        it('should return the value of the resolved promise', function () {
          const api = function(name) {
            return Promise.resolve(`hello ${ name }`);
          }
          const handler = function * () {
            const newState = yield call(api, 'stent');

            return newState;
          }
          const machine = {
            state: { name: 'idle', data: 42 },
            transitions: {
              idle: { run: handler }
            }
          };
    
          handleAction(machine, 'run');
          return Promise.resolve().then(() => {
            expect(machine.state).to.deep.equal({ name: 'hello stent' });
          });
        });
        it('should throw an error if the promise is rejected', function () {
          const api = function(name) {
            return Promise.reject(`error ${ name }`);
          }
          const handler = function * () {
            try {
              const newState = yield call(api, 'stent');
            } catch(error) {
              return error.message;
            }

            return newState;
          }
          const machine = {
            state: { name: 'idle', data: 42 },
            transitions: {
              idle: { run: handler }
            }
          };
    
          handleAction(machine, 'run');
          return Promise.resolve().then(() => {
            expect(machine.state).to.deep.equal({ name: 'error stent' });
          });
        });
      });
      describe('when the function returns another generator', function () {
        it('should iterate through that inner generator', function () {
          const api = function * (name) {
            yield 42;
            return yield call(() => Promise.resolve(`${ name }: merry christmas`));
          }
          const handler = function * () {
            return yield call(api, 'stent');
          }
          const machine = {
            state: { name: 'idle', data: 42 },
            transitions: {
              idle: { run: handler }
            }
          };
    
          handleAction(machine, 'run');
          return Promise.resolve().then(() => {
            expect(machine.state).to.deep.equal({ name: 'stent: merry christmas' });
          });
        });
      });
    });
  });

});