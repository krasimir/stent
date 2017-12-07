'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('../../');

var _DevTools = require('../DevTools');

var _DevTools2 = _interopRequireDefault(_DevTools);

var _helpers = require('../../helpers');

var _react = require('../../react');

var _enzyme = require('enzyme');

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  name: 'Foo',
  state: { name: 'idle' },
  transitions: { idle: { run: 'running', a: function a() {} }, 'running': { stop: 'idle ' } }
};
var createMachine = function createMachine() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults,
      name = _ref.name,
      state = _ref.state,
      transitions = _ref.transitions;

  return _.Machine.create(name, { state: state, transitions: transitions });
};
var createCircularStructure = function createCircularStructure() {
  var a = { answer: 42 };
  a.b = [a, a];
  return a;
};

describe('Given the DevTools middleware', function () {
  beforeEach(function () {
    sinon.stub(window.top, 'postMessage');
    _.Machine.flush();
    _.Machine.addMiddleware(_DevTools2.default);
  });
  afterEach(function () {
    window.top.postMessage.restore();
  });
  describe('when adding the middleware', function () {
    it('should post an action with `pageRefresh` set to true', function () {
      expect(window.top.postMessage).to.be.calledOnce.and.to.be.calledWith({
        source: 'stent',
        time: sinon.match.number,
        uid: sinon.match.string,
        pageRefresh: true,
        machines: []
      });
    });
    describe('and when we create a machine', function () {
      it('should dispatch a `onMachineCreated` message and serialize the machine', function () {
        var Component = function Component() {
          return _react3.default.createElement(
            'p',
            null,
            'Hello world'
          );
        };

        _.Machine.create('Foo', {
          state: { name: 'idle' },
          transitions: {
            idle: {
              save: /*#__PURE__*/regeneratorRuntime.mark(function save() {
                return regeneratorRuntime.wrap(function save$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return { name: 'fetching' };

                      case 2:
                        _context.t0 = this;
                        _context.next = 5;
                        return (0, _helpers.call)(api);

                      case 5:
                        _context.t1 = _context.sent;

                        _context.t0.success.call(_context.t0, _context.t1);

                      case 7:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, save, this);
              })
            },
            fetching: {
              success: function success(state, answer) {
                return { name: 'idle', answer: answer };
              }
            }
          }
        });
        (0, _react.connect)(Component).with('Foo').map(function (machine) {
          return {};
        });

        expect(window.top.postMessage).to.be.calledWith({
          uid: sinon.match.string,
          time: sinon.match.number,
          source: 'stent',
          type: 'onMachineCreated',
          meta: { middlewares: 1 },
          machines: [{ name: "Foo", state: { name: "idle" } }],
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
        var machine = createMachine(_extends({}, defaults, { name: undefined }));

        machine.run(41, 'answer', ['a', 'b'], { a: { b: [1, 2] } }, createCircularStructure());

        var exp = function exp(type) {
          return sinon.match({
            source: 'stent',
            type: type,
            actionName: 'run',
            args: [41, 'answer', ['a', 'b'], { a: { b: [1, 2] } }, { answer: 42, b: ['~4', '~4'] }]
          });
        };

        expect(window.top.postMessage).to.be.calledWith(exp('onActionDispatched'));
        expect(window.top.postMessage).to.be.calledWith(exp('onActionProcessed'));
      });
    });
    describe('and when we change the state', function () {
      it('should dispatch `onStateWillChange', function () {
        var machine = createMachine();

        machine.run();
        var exp = function exp(type) {
          return sinon.match({
            source: 'stent',
            type: type,
            machine: sinon.match({
              state: { name: 'idle' }
            })
          });
        };

        expect(window.top.postMessage).to.be.calledWith(exp('onStateWillChange'));
      });
      it('should dispatch `onStateChanged', function () {
        var machine = createMachine();

        machine.run();
        var exp = function exp(type) {
          return sinon.match({
            source: 'stent',
            type: type,
            machine: sinon.match({
              state: { name: 'running' }
            })
          });
        };

        expect(window.top.postMessage).to.be.calledWith(exp('onStateChanged'));
      });
    });
    describe('and we use a generator as a handler', function () {
      it('should dispatch `onGeneratorStep` action', function (done) {

        var foo = function foo() {
          return [1, 2, 3, 4];
        };
        var bar = function bar() {
          return Promise.resolve('jumping');
        };
        var zar = function zar(error) {
          return Promise.reject(error);
        };
        var mar = /*#__PURE__*/regeneratorRuntime.mark(function mar(a) {
          return regeneratorRuntime.wrap(function mar$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return (0, _helpers.call)(bar, { a: a });

                case 2:
                  return _context2.abrupt('return', _context2.sent);

                case 3:
                case 'end':
                  return _context2.stop();
              }
            }
          }, mar, this);
        });
        var exp = function exp(yielded) {
          expect(window.top.postMessage).to.be.calledWith(sinon.match({ type: 'onGeneratorStep', yielded: yielded }));
        };
        var expResumed = function expResumed(value) {
          expect(window.top.postMessage).to.be.calledWith(sinon.match({ type: 'onGeneratorResumed', value: value }));
        };

        var machine = _.Machine.create({ name: 'idle' }, {
          idle: {
            run: /*#__PURE__*/regeneratorRuntime.mark(function run() {
              var fooAnswer, barAnswer;
              return regeneratorRuntime.wrap(function run$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return { name: 'running' };

                    case 2:
                      _context3.next = 4;
                      return (0, _helpers.call)(foo, 'arg1', 'arg2');

                    case 4:
                      fooAnswer = _context3.sent;
                      _context3.next = 7;
                      return (0, _helpers.call)(bar, fooAnswer);

                    case 7:
                      barAnswer = _context3.sent;
                      _context3.prev = 8;
                      _context3.next = 11;
                      return (0, _helpers.call)(zar, barAnswer);

                    case 11:
                      _context3.next = 19;
                      break;

                    case 13:
                      _context3.prev = 13;
                      _context3.t0 = _context3['catch'](8);
                      _context3.next = 17;
                      return (0, _helpers.call)(mar, _context3.t0);

                    case 17:
                      _context3.next = 19;
                      return _context3.sent;

                    case 19:

                      exp({ name: 'running' }); // 1
                      exp({ __type: 'call', args: ['arg1', 'arg2'], func: 'foo' }); // 2
                      exp({ __type: 'call', args: [[1, 2, 3, 4]], func: 'bar' }); // 3
                      exp({ __type: 'call', args: ['jumping'], func: 'zar' }); // 4
                      exp({ __type: 'call', args: ['jumping'], func: 'mar' }); // 5
                      exp({ __type: 'call', args: [{ a: 'jumping' }], func: 'bar' }); // 6
                      exp('jumping'); // 7
                      expResumed(null);
                      expResumed([1, 2, 3, 4]);
                      expResumed('jumping');
                      expect(this.state.name).to.be.equal('jumping');
                      expect(window.top.postMessage).to.be.calledWith(sinon.match({ type: 'onGeneratorEnd', value: 'jumping' }));

                      done();

                    case 32:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, run, this, [[8, 13]]);
            })
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
          var brokenAPI = function brokenAPI() {
            return Promise.reject(new Error('Ops'));
          };
          var machine = _.Machine.create({ name: 'idle' }, {
            idle: {
              run: /*#__PURE__*/regeneratorRuntime.mark(function run() {
                return regeneratorRuntime.wrap(function run$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.prev = 0;
                        _context4.next = 3;
                        return (0, _helpers.call)(brokenAPI);

                      case 3:
                        _context4.next = 9;
                        break;

                      case 5:
                        _context4.prev = 5;
                        _context4.t0 = _context4['catch'](0);

                        expect(window.top.postMessage).to.be.calledWith(sinon.match({
                          type: 'onGeneratorResumed',
                          value: sinon.match({
                            message: 'Ops',
                            name: 'Error'
                          })
                        }));
                        done();

                      case 9:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, run, this, [[0, 5]]);
              })
            }
          });

          machine.run();
        });
      });
    });
    describe('and when we connect to the machine', function () {
      it('should dispatch `onMachineConnected` action', function () {
        var machine = createMachine();
        var machine2 = createMachine(_extends({}, defaults, { name: 'Bar' }));

        (0, _helpers.connect)().with('Foo').map(function (Foo) {});

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineConnected',
          machines: [sinon.match({ name: 'Foo' }), sinon.match({ name: 'Bar' })],
          meta: { machines: [sinon.match({ name: 'Foo' })], middlewares: 2 }
        }));
      });
      it('should dispatch `onMachineDisconnected` action', function () {
        var machine = createMachine();
        var disconnect = (0, _helpers.connect)().with('Foo').map(function (Foo) {});
        var machine2 = createMachine(_extends({}, defaults, { name: 'Bar' }));

        disconnect();

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineDisconnected',
          machines: [sinon.match({ name: 'Foo' }), sinon.match({ name: 'Bar' })],
          meta: { machines: [sinon.match({ name: 'Foo' })], middlewares: 2 }
        }));
      });
    });
    describe('and when we use connect for a React component', function () {
      it('should dispatch `onMachineConnected` action' + ' and `onMachineDisconnected` action when we unmount the component', function () {
        var machine = createMachine();
        var Component = function XXX() {
          return _react3.default.createElement(
            'p',
            null,
            'Hello world'
          );
        };

        var ConnectedComponent = (0, _react.connect)(Component).with('Foo').map(function (Foo) {
          return { a: 1 };
        });

        expect(window.top.postMessage).to.be.calledTwice;
        expect(window.top.postMessage.firstCall).to.be.calledWith(sinon.match({
          pageRefresh: true
        }));
        expect(window.top.postMessage.secondCall).to.be.calledWith(sinon.match({
          type: 'onMachineCreated'
        }));

        var wrapper = (0, _enzyme.mount)(_react3.default.createElement(ConnectedComponent, null));

        expect(window.top.postMessage).to.be.calledThrice;

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineConnected',
          machines: [sinon.match({ name: 'Foo' })],
          meta: { middlewares: 2, component: 'XXX' }
        }));

        wrapper.unmount();

        expect(window.top.postMessage).to.be.calledWith(sinon.match({
          type: 'onMachineDisconnected',
          machines: [sinon.match({ name: 'Foo' })],
          meta: { middlewares: 2, component: 'XXX' }
        }));
      });
    });
  });
});