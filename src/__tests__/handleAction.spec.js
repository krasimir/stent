import handleAction from '../handleAction';
import {
  ERROR_MISSING_ACTION_IN_STATE,
  ERROR_UNCOVERED_STATE,
  ERROR_NOT_SUPPORTED_HANDLER_TYPE,
  WAIT_LISTENERS_STORAGE
} from '../constants';
import { call, wait } from '../helpers';
import { Machine } from '../';

describe('Given the handleAction function', function () {
  beforeEach(() => {
    Machine.flush();
  });

  describe('when we add a handler which is not expected', function () {
    it('should throw an error', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 42 },
          running: { stop: 'foo' }
        }
      };

      expect(handleAction.bind(null, machine, 'run'))
        .to.throw(ERROR_NOT_SUPPORTED_HANDLER_TYPE);
    });
  });

  describe('when dispatching an action which is missing in the current state', function () {
    it('should silently do nothing and NOT throw an error (handleAction returns false)', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'foo' }
        }
      };

      expect(handleAction(machine, 'stop', 'a', 'b')).to.equal(false);;
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

  describe('when we transition to a state which has no actions or it is undefined', function () {
    it('should throw an error if there is no such a state defined', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: {
            'run': 'running'
          }
        }
      };

      expect(handleAction.bind(null, machine, 'run')).to.throw(ERROR_UNCOVERED_STATE('running'));
    });
    it('should throw an error if there the state has no actions inside', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: {
            'run': 'running'
          },
          running: {}
        }
      };

      expect(handleAction.bind(null, machine, 'run')).to.throw(ERROR_UNCOVERED_STATE('running'));
    });
  });

  describe('when the handler is a string', function () {
    it('should change the state of the machine to that string', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
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
        state: { name: 'idle' },
        transitions: {
          idle: { run: newState },
          running: { stop: 'idle' }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state).to.deep.equal(newState);
    });
  });

  describe('when the handler is a function', function () {
    it('should call the handler with the current state and the given payload', function () {
      const handler = sinon.spy();
      const payload = ['foo', 'bar', 'baz'];
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler },
          running: { stop: 'idle' }
        }
      };

      handleAction(machine, 'run', ...payload);
      expect(handler).to.be.calledOnce.and.to.be.calledWith(
        { name: 'idle'}, 'foo', 'bar', 'baz'
      );
    });
    it('should update the state', function () {
      const handler = (state, payload) => ({ name: 'bar', data: payload });
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler },
          bar: { a: 'b' }
        }
      };

      handleAction(machine, 'run', 42);
      expect(machine.state).to.deep.equal({ name: 'bar', data: 42 });
    });
    it('should update the state even if a string is returned', function () {
      const handler = (state, payload) => 'bar';
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler },
          bar: { a: 'b' }
        }
      };

      handleAction(machine, 'run');
      expect(machine.state).to.deep.equal({ name: 'bar' });
    });
    it('should run the handler with the machine as a context', function () {
      const handler = function () {
        expect(this.state).to.deep.equal({ name: 'idle', data: 42 });
        return 'foo';
      }
      const machine = {
        state: { name: 'idle', data: 42 },
        transitions: {
          idle: { run: handler },
          foo: { a: 'b' }
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
          idle: { run: handler },
          foo: { a: 'b' },
          bar: { a: 'b' },
          running: { a: 'b' }
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
          idle: { run: handler },
          '100': { a: 'b' }
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
          idle: { run: handler },
          running: { a: 'b' },
          jumping: { a: 'b' }
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
            idle: { run: handler },
            'hello stent': 'a'
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
              idle: { run: handler },
              'hello stent': 'a'
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
              idle: { run: handler },
              'error stent': 'a'
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
              idle: { run: handler },
              '42': 'a',
              'stent: merry christmas': 'b'
            }
          };
    
          handleAction(machine, 'run');
          return Promise.resolve().then(() => {
            expect(machine.state).to.deep.equal({ name: 'stent: merry christmas' });
          });
        });
      });
    });

    describe('and we use the wait helper', function () {
      it('should wait till the other action is dispatched', function (done) {
        const handler = function * () {
          const [ a, b ] = yield wait(['push the machine', 'pull the machine']);
          const answer = yield wait('stop the machine');

          return `the answer is ${ answer }: ${ a } + ${ b }`;
        }
        const machine = {
          state: { name: 'idle' },
          transitions: {
            idle: {
              run: handler,
              'stop the machine': () => {},
              'push the machine': () => {},
              'pull the machine': () => {},
              'destroy the machine': () => {}
            },
            'the answer is 42: 20 + 22': { a: 'b' }
          }
        };
  
        handleAction(machine, 'run');
        handleAction(machine, 'destroy the machine');
        handleAction(machine, 'pull the machine', 22);
        setTimeout(() => handleAction(machine, 'push the machine', 20), 5);
        setTimeout(() => handleAction(machine, 'stop the machine', 42), 10);
        setTimeout(() => {
          expect(machine[WAIT_LISTENERS_STORAGE]).to.be.undefined;
          expect(machine.state).to.deep.equal({ name: 'the answer is 42: 20 + 22' });
          done();
        }, 100);
      });
      describe('and we pass multiple actions but as args of wait', function () {
        it('should work the same way as we pass an array', function (done) {
          const handler = function * () {
            const [ a, b ] = yield wait('push the machine', 'pull the machine');
            const answer = yield wait('stop the machine');
  
            return `the answer is ${ answer }: ${ a } + ${ b }`;
          }
          const machine = {
            state: { name: 'idle' },
            transitions: {
              idle: {
                run: handler,
                'stop the machine': () => {},
                'push the machine': () => {},
                'pull the machine': () => {},
                'destroy the machine': () => {}
              },
              'the answer is 42: 20 + 22': { a: 'b' }
            }
          };
    
          handleAction(machine, 'run');
          handleAction(machine, 'destroy the machine');
          handleAction(machine, 'pull the machine', 22);
          setTimeout(() => handleAction(machine, 'push the machine', 20), 5);
          setTimeout(() => handleAction(machine, 'stop the machine', 42), 10);
          setTimeout(() => {
            expect(machine[WAIT_LISTENERS_STORAGE]).to.be.undefined;
            expect(machine.state).to.deep.equal({ name: 'the answer is 42: 20 + 22' });
            done();
          }, 100);
        });
      });
    });
  });

  describe('when we have middlewares registered', function () {
    it('should fire the middleware/s if an action is dispatched', function (done) {
      Machine.addMiddleware([
        {
          onActionDispatched(next, actionName, ...args) {
            expect(actionName).to.equal('run');
            expect(args).to.deep.equal([ { answer: 42 } ]);
            next();
            expect(machine.state).to.deep.equal({ name: 'running' });
          }
        },
        {
          onActionDispatched(next, actionName, ...args) {
            expect(actionName).to.equal('run');
            expect(args).to.deep.equal([ { answer: 42 } ]);
            next();
            expect(machine.state).to.deep.equal({ name: 'running' });
            done();
          }
        }
      ]);
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      };

      handleAction(machine, 'run', { answer: 42 });
    });
    it('should pass the machine as context', function () {
      const spy = sinon.spy();
      const machineA = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      };
      const machineB = {
        state: { name: 'nothing' },
        transitions: {
          nothing: { run: 'foobar' },
          foobar: { stop: 'nothing' }
        }
      };
      Machine.addMiddleware({
        onActionDispatched(next, actionName, ...args) {
          next();
          spy(this.state.name);
        }
      });

      handleAction(machineA, 'run');
      handleAction(machineB, 'run');

      expect(spy).to.be.calledTwice;
      expect(spy.firstCall).to.be.calledWith('running');
      expect(spy.secondCall).to.be.calledWith('foobar');
    });
    it('should skip to the next middleware if there is no appropriate hook defined', function (done) {
      Machine.addMiddleware([
        {
          onStateChanged(next) { next(); }
        },
        {
          onActionDispatched(next, actionName, ...args) {
            next();
            expect(this.state).to.deep.equal({ name: 'running' });
            done();
          }
        }
      ]);
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      };

      handleAction(machine, 'run', { answer: 42 });
    });
    it('should fire the middleware/s when the state is changed', function (done) {
      Machine.addMiddleware([
        {
          onStateChanged(next) {
            expect(this.state).to.deep.equal({ name: 'idle' });
            next();
            expect(this.state).to.deep.equal({ name: 'running' });
          }
        },
        {
          onStateChanged(next) {
            done();
          }
        }
      ]);
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      };

      handleAction(machine, 'run', { answer: 42 });
    });
  });

});