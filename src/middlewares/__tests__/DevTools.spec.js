import { Machine } from '../../';
import DevTools from '../DevTools';
import { call, connect } from '../../helpers';
import { connect as connectReactComponent } from '../../react';
import { mount } from 'enzyme';
import React from 'react';

const defaults = {
  name: 'Foo',
  state: { name: 'idle' },
  transitions: { idle: { run: 'running', a: () => {} }, 'running': { stop: 'idle '} }
}
const createMachine = function ({ name, state, transitions } = defaults) {
  return Machine.create(name, { state, transitions });
}
const createCircularStructure = function () {
  const a = { answer: 42 };
  a.b = [ a, a ];
  return a;
}

describe('Given the DevTools middleware', function () {
  beforeEach(() => {
    sinon.stub(window.top, 'postMessage');
    Machine.flush();
    Machine.addMiddleware(DevTools);
  });
  afterEach(() => {
    window.top.postMessage.restore();
  });
  describe('when adding the middleware', function () {
    it('should post an action with `pageRefresh` set to true', function () {
      expect(window.top.postMessage)
        .to.be.calledOnce
        .and.to.be.calledWith({
          source: 'stent',
          time: sinon.match.number,
          uid: sinon.match.string,
          pageRefresh: true,
          state: []
        });
    });
    describe('and when we create a machine', function () {
      it('should dispatch a `onMachineCreated` message and serialize the machine', function () {
        const Component = () => <p>Hello world</p>;

        Machine.create('Foo', {
          state: { name: 'idle' },
          transitions: {
            idle: {
              save: function*() {
                yield { name: 'fetching' };
                this.success(yield call(api));
              }
            },
            fetching: {
              success(state, answer) {
                return { name: 'idle', answer };
              }
            }
          }
        });
        connectReactComponent(Component).with('Foo').map(machine => ({}));

        expect(window.top.postMessage).to.be.calledWith({
          uid: sinon.match.string,
          time: sinon.match.number,
          source: 'stent',
          type: 'onMachineCreated',
          meta: { middlewares: 1 },
          state: [{ name: "Foo", state: { name: "idle" } }],
          machine: {
            "name": "Foo",
            "state": {
              "name": "idle"
            },
            "transitions": {
              "idle": {
                "save": {
                  "__func": "save"
                }
              },
              "fetching": {
                "success": {
                  "__func": "success"
                }
              }
            },
            "isIdle": {
              "__func": "<anonymous>"
            },
            "save": {
              "__func": "<anonymous>"
            },
            "isFetching": {
              "__func": "<anonymous>"
            },
            "success": {
              "__func": "<anonymous>"
            }
          }
        });
      });
    });
    describe('and when we dispatch an action', function () {
      it('should dispatch `onActionDispatched` message and `onActionProcessed`', function () {
        const machine = createMachine({ ...defaults, ...{ name: undefined } });

        machine.run(
          41,
          'answer',
          ['a', 'b'],
          { a: { b: [1, 2] } },
          createCircularStructure()
        );

        const exp = type => sinon.match({
          source: 'stent',
          type,
          actionName: 'run',
          args: [
            41,
            'answer',
            ['a', 'b'],
            { a: { b: [1, 2] } },
            { answer: 42, b: ['~4', '~4'] }
          ]
        });

        expect(window.top.postMessage).to.be.calledWith(exp('onActionDispatched'));
        expect(window.top.postMessage).to.be.calledWith(exp('onActionProcessed'));
      });
    });
    describe('and when we change the state', function () {
      it('should dispatch `onStateWillChange', function () {
        const machine = createMachine();

        machine.run();
        const exp = type => sinon.match({
          source: 'stent',
          type,
          machine: sinon.match({
            state: { name: 'idle' }
          })
        });

        expect(window.top.postMessage).to.be.calledWith(exp('onStateWillChange'));
      });
      it('should dispatch `onStateChanged', function () {
        const machine = createMachine();

        machine.run();
        const exp = type => sinon.match({
          source: 'stent',
          type,
          machine: sinon.match({
            state: { name: 'running' }
          })
        });

        expect(window.top.postMessage).to.be.calledWith(exp('onStateChanged'));
      });
    });
    describe('and we use a generator as a handler', function () {
      it('should dispatch `onGeneratorStep` action', function (done) {

        const foo = function foo() { return [ 1, 2, 3, 4 ]; }
        const bar = function () { return Promise.resolve('jumping'); }
        const zar = function (error) { return Promise.reject(error); }
        const mar = function * (a) { return yield call(bar, { a } ); }
        const exp = yielded => {
          expect(window.top.postMessage).to.be.calledWith(sinon.match({ type: 'onGeneratorStep', yielded }));
        }
        const expResumed = value => {
          expect(window.top.postMessage).to.be.calledWith(sinon.match({ type: 'onGeneratorResumed', value }));
        }

        const machine = Machine.create({ name: 'idle' }, {
          idle: {
            run: function * () {
              yield { name: 'running' }; // 1
              const fooAnswer = yield call(foo, 'arg1', 'arg2'); // 2
              const barAnswer = yield call(bar, fooAnswer); // 3
              try {
                yield call(zar, barAnswer); // 4
              } catch(error) {
                yield yield call(mar, error); // 5
              }
              
              exp({ name: 'running' }); // 1
              exp({ __type: 'call', args: ['arg1', 'arg2'], func: 'foo' }) // 2
              exp({ __type: 'call', args: [[1, 2, 3, 4]], func: 'bar' }) // 3
              exp({ __type: 'call', args: ['jumping'], func: 'zar' }) // 4
              exp({ __type: 'call', args: ['jumping'], func: 'mar' }) // 5
              exp({ __type: 'call', args: [{ a: 'jumping' }], func: 'bar' }); // 6
              exp('jumping'); // 7
              expResumed(null);
              expResumed([ 1, 2, 3, 4 ]);
              expResumed('jumping');
              expect(this.state.name).to.be.equal('jumping');
              expect(window.top.postMessage).to.be.calledWith(
                sinon.match({ type: 'onGeneratorEnd', value: 'jumping' })
              );
              
              done();
            }
          },
          running: {
            stop: 'idle'
          },
          jumping: {
            stop: 'idle'
          }
        });
        machine.run();
      });
      describe('and the generator throws an error', function () {
        it('should serialize the error in a proper way', function (done) {
          const brokenAPI = () => Promise.reject(new Error('Ops'));
          const machine = Machine.create({ name: 'idle' }, {
            idle: {
              run: function * () {
                try {
                  yield call(brokenAPI);
                } catch (error) {
                  expect(window.top.postMessage).to.be.calledWith(
                    sinon.match({
                      type: 'onGeneratorResumed',
                      value: sinon.match({
                        message: 'Ops',
                        name: 'Error'
                      })
                    })
                  );
                  done();
                }
              }
            }
          });

          machine.run();
        });
      });
    });
    describe('and when we connect to the machine', function () {
      it('should dispatch `onMachineConnected` action', function () {
        const machine = createMachine();
        const machine2 = createMachine({ ...defaults, name: 'Bar' });

        connect().with('Foo').map(Foo => {});

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineConnected',
          state: [ sinon.match({ name: 'Foo' }), sinon.match({ name: 'Bar' }) ],
          meta: { machines: [ sinon.match({ name: 'Foo' })], middlewares: 2 }
        }));
      });
      it('should dispatch `onMachineDisconnected` action', function () {
        const machine = createMachine();
        const disconnect = connect().with('Foo').map(Foo => {});
        const machine2 = createMachine({ ...defaults, name: 'Bar' });

        disconnect();

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineDisconnected',
          state: [ sinon.match({ name: 'Foo' }), sinon.match({ name: 'Bar' }) ],
          meta: { machines: [ sinon.match({ name: 'Foo' })], middlewares: 2 }
        }));
      });
    });
    describe('and when we use connect for a React component', function () {
      it('should dispatch `onMachineConnected` action' + 
      ' and `onMachineDisconnected` action when we unmount the component', function () {
        const machine = createMachine();
        const Component = function XXX() { return <p>Hello world</p>; }

        const ConnectedComponent = connectReactComponent(Component).with('Foo').map(Foo => ({ a: 1 }));

        expect(window.top.postMessage).to.be.calledTwice;
        expect(window.top.postMessage.firstCall).to.be.calledWith(sinon.match({
          pageRefresh: true
        }))
        expect(window.top.postMessage.secondCall).to.be.calledWith(sinon.match({
          type: 'onMachineCreated'
        }));

        const wrapper = mount(<ConnectedComponent />);

        expect(window.top.postMessage).to.be.calledThrice;

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineConnected',
          state: [ sinon.match({ name: 'Foo' }) ],
          meta: { middlewares: 2, component: 'XXX' }
        }));

        wrapper.unmount();

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineDisconnected',
          state: [ sinon.match({ name: 'Foo' }) ],
          meta: { middlewares: 2, component: 'XXX' }
        }));
      });
    });
  });
});