'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ = require('../../');

var _connect = require('../connect');

var _connect2 = _interopRequireDefault(_connect);

var _enzyme = require('enzyme');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var wrapper;
var mapping = sinon.spy();

var Component = function (_React$Component) {
  _inherits(Component, _React$Component);

  function Component() {
    _classCallCheck(this, Component);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  Component.prototype.render = function render() {
    var _this2 = this;

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'p',
        { id: 'A' },
        this.props.message('machine A', this.props.stateA)
      ),
      _react2.default.createElement(
        'p',
        { id: 'B' },
        this.props.message('machine B', this.props.stateB)
      ),
      _react2.default.createElement(
        'button',
        { id: 'run', onClick: function onClick() {
            return _this2.props.run();
          } },
        'run'
      ),
      _react2.default.createElement(
        'button',
        { id: 'fetch', onClick: function onClick() {
            return _this2.props.fetch();
          } },
        'fetch'
      )
    );
  };

  return Component;
}(_react2.default.Component);

function getWrapper(once, m) {
  var mappingFunc = function mappingFunc(A, B) {
    mapping(A, B);
    return {
      stateA: A.state.name,
      stateB: B.state.name,
      run: A.run,
      fetch: B.fetch
    };
  };
  var ConnectedComponent = (0, _connect2.default)(Component).with('A', 'B')[once ? 'mapOnce' : 'map'](typeof m === 'undefined' ? mappingFunc : m);
  var message = function message(machineName, state) {
    return machineName + ' is in a ' + state + ' state';
  };

  return (0, _enzyme.mount)(_react2.default.createElement(ConnectedComponent, { message: message }));
}

describe('Given the connect React helper', function () {
  beforeEach(function () {
    mapping.reset();
    _.Machine.flush();
    _.Machine.create('A', {
      state: { name: 'idle' },
      transitions: {
        idle: { run: 'running' },
        running: { stop: 'idle' }
      }
    });
    _.Machine.create('B', {
      state: { name: 'waiting' },
      transitions: {
        waiting: { fetch: 'fetching' },
        fetching: { done: 'waiting' }
      }
    });
  });
  describe('when connecting a component', function () {
    it('should call our mapping function', function () {
      wrapper = getWrapper();
      expect(mapping).to.be.calledOnce;
    });
    it('should map machines state and actions properly', function () {
      wrapper = getWrapper();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });
    it('should get re-rendered if a machine\'s state is changed', function () {
      wrapper = getWrapper();
      var runButton = wrapper.find('button#run');
      var fetchButton = wrapper.find('button#fetch');

      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      runButton.simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      runButton.simulate('click');
      runButton.simulate('click');
      runButton.simulate('click');

      fetchButton.simulate('click');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a fetching state');
    });
    it('should NOT get re-rendered if mapped with `mapOnce`', function () {
      wrapper = getWrapper(true);
      wrapper.find('button#run').simulate('click');
      wrapper.find('button#fetch').simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });

    describe('when we update the state of the machine many times in a single frame', function () {
      it('should trigger the mapping function many times', function () {
        var render = sinon.spy();
        var Comp = function Comp() {
          render();
          return _react2.default.createElement(
            'p',
            null,
            'Hello'
          );
        };
        var machine = _.Machine.create('C', {
          state: { name: 'idle', counter: 0 },
          transitions: {
            idle: {
              run: function run(_ref) {
                var state = _ref.state;

                return { name: 'idle', counter: state.counter + 1 };
              }
            }
          }
        });
        var mappingFunction = sinon.stub().returns(function () {
          return { counter: machine.state.counter };
        });
        var ConnectedComponent = (0, _connect2.default)(Comp).with('C').map(mappingFunction);

        (0, _enzyme.mount)(_react2.default.createElement(ConnectedComponent, { message: 'Hello' }));

        machine.run();
        machine.run();
        machine.run();
        machine.run();
        machine.run();
        machine.run();

        expect(mappingFunction).to.be.calledWith(sinon.match({
          state: { counter: 6, name: 'idle' }
        }));
        expect(render.callCount).to.be.equal(7);
      });
    });
  });
  describe('when unmounting the component', function () {
    it('should detach from the machines', function () {
      wrapper = getWrapper();
      _.Machine.get('A').run();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      _.Machine.get('A').stop();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      wrapper.unmount();
      _.Machine.get('A').run();
      expect(mapping.callCount).to.be.equal(3);
    });
  });
  describe("when remounting the component", function () {
    it("should display up-to-date machine state", function () {
      var Wired = (0, _connect2.default)(Component).with("A", "B").map(function (A, B) {
        return {
          stateA: A.state.name,
          stateB: B.state.name
        };
      });

      var msg = function msg(machineName, state) {
        return machineName + ' is in a ' + state + ' state';
      };

      var mounted = (0, _enzyme.mount)(_react2.default.createElement(Wired, { message: msg }));

      _.Machine.get("A").run();
      _.Machine.get("B").fetch();

      expect(mounted.find("p#A").text()).to.equal("machine A is in a running state");
      expect(mounted.find("p#B").text()).to.equal("machine B is in a fetching state");

      mounted.unmount();

      // Change machine states while the component is unmounted
      _.Machine.get("A").stop();
      _.Machine.get("B").done();

      var remounted = (0, _enzyme.mount)(_react2.default.createElement(Wired, { message: msg }));

      expect(remounted.find("p#A").text()).to.equal("machine A is in a idle state");

      expect(remounted.find("p#B").text()).to.equal("machine B is in a waiting state");
    });
  });

  describe('when we connect without mapping', function () {
    it('should render correctly', function () {
      var Component = function (_React$Component2) {
        _inherits(Component, _React$Component2);

        function Component(props) {
          _classCallCheck(this, Component);

          var _this3 = _possibleConstructorReturn(this, _React$Component2.call(this, props));

          _this3.counter = 0;
          return _this3;
        }

        Component.prototype.render = function render() {
          this.counter += 1;
          return _react2.default.createElement(
            'p',
            null,
            'Rendered ',
            this.counter,
            ' times'
          );
        };

        return Component;
      }(_react2.default.Component);

      var Connected = (0, _connect2.default)(Component).with('A', 'B').map();
      var connectedWrapper = (0, _enzyme.mount)(_react2.default.createElement(Connected, null));
      _.Machine.get('A').run();
      _.Machine.get('A').stop();
      // 1 - initial render
      // 2 - because of machine's action run
      // 3 - because of machine's action stop 
      expect(connectedWrapper.find('p').text()).to.equal('Rendered 3 times');
    });
  });
  describe('when we use mapSilent', function () {
    it('should only call the mapping function when the machine changes its state', function () {
      var Component = function (_React$Component3) {
        _inherits(Component, _React$Component3);

        function Component(props) {
          _classCallCheck(this, Component);

          var _this4 = _possibleConstructorReturn(this, _React$Component3.call(this, props));

          _this4.counter = 0;
          return _this4;
        }

        Component.prototype.render = function render() {
          this.counter += 1;
          return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'p',
              { id: 'A' },
              this.props.message('machine A', this.props.stateA)
            ),
            _react2.default.createElement(
              'p',
              { id: 'counter' },
              'Rendered ',
              this.counter,
              ' times'
            )
          );
        };

        return Component;
      }(_react2.default.Component);

      var message = function message(machineName, state) {
        return machineName + ' is in a ' + state + ' state';
      };
      var Connected = (0, _connect2.default)(Component).with('A', 'B').mapSilent(function (A) {
        return {
          stateA: A.state.name
        };
      });
      var connectedWrapper = (0, _enzyme.mount)(_react2.default.createElement(Connected, { message: message }));
      expect(connectedWrapper.find('p#A').text()).to.equal('machine A is in a undefined state');
      _.Machine.get('A').run();
      expect(connectedWrapper.find('p#A').text()).to.equal('machine A is in a running state');
      // 1 - initial render
      // 2 - because of machine's action run
      expect(connectedWrapper.find('p#counter').text()).to.equal('Rendered 2 times');
    });
  });
  describe('and we have a middleware attached', function () {
    it('should call the proper hooks', function () {
      var onMachineConnected = sinon.spy();
      var onMachineDisconnected = sinon.spy();

      _.Machine.addMiddleware({ onMachineConnected: onMachineConnected, onMachineDisconnected: onMachineDisconnected });

      var machine = _.Machine.create('foo', { state: {}, transitions: {} });
      var Zoo = function Zoo() {
        return _react2.default.createElement(
          'p',
          null,
          'Hello world'
        );
      };
      var Connected = (0, _connect2.default)(Zoo).with('foo').map(function () {
        return {};
      });
      var connectedWrapper = (0, _enzyme.mount)(_react2.default.createElement(Connected, null));

      expect(onMachineConnected).to.be.calledOnce.and.to.be.calledWith(sinon.match.array, sinon.match({ component: 'Zoo' }));
      expect(onMachineDisconnected).to.not.be.called;
      connectedWrapper.unmount();
      expect(onMachineDisconnected).to.be.calledOnce.and.to.be.calledWith(sinon.match.array, sinon.match({ component: 'Zoo' }));
    });
    describe('and we destroy a machine', function () {
      it('should call the proper hooks', function () {
        var onMachineConnected = sinon.spy();
        var onMachineDisconnected = sinon.spy();

        _.Machine.addMiddleware({ onMachineConnected: onMachineConnected, onMachineDisconnected: onMachineDisconnected });

        var machine = _.Machine.create('foo', { state: {}, transitions: {} });
        var Component = function Component() {
          return _react2.default.createElement(
            'p',
            null,
            'Hello world'
          );
        };
        var Connected = (0, _connect2.default)(Component).with('foo').map(function () {
          return {};
        });
        var connectedWrapper = (0, _enzyme.mount)(_react2.default.createElement(Connected, null));

        expect(onMachineConnected).to.be.calledOnce;
        expect(onMachineDisconnected).to.not.be.called;
        machine.destroy();
        expect(onMachineDisconnected).to.be.calledOnce;
      });
    });
  });

  describe('and the problem described in issue #13', function () {
    it('should map the transition handler properly', function () {
      var spy = sinon.spy();

      var Issue13 = function (_React$Component4) {
        _inherits(Issue13, _React$Component4);

        function Issue13() {
          _classCallCheck(this, Issue13);

          return _possibleConstructorReturn(this, _React$Component4.apply(this, arguments));
        }

        Issue13.prototype.componentDidMount = function componentDidMount() {
          this.props.startProcess();
        };

        Issue13.prototype.render = function render() {
          return _react2.default.createElement(
            'p',
            null,
            'Hello world'
          );
        };

        return Issue13;
      }(_react2.default.Component);

      _.Machine.create('issue13', {
        state: { name: 'init' },
        transitions: {
          init: { startProcess: spy, 'ab': function ab() {} }
        }
      });

      var ConnectedIssue13 = (0, _connect2.default)(Issue13).with('issue13').map(function (_ref2) {
        var startProcess = _ref2.startProcess;
        return { startProcess: startProcess };
      });

      (0, _enzyme.mount)(_react2.default.createElement(ConnectedIssue13, null));
    });
  });
});