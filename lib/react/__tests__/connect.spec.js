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

function getWrapper(once) {
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

  var ConnectedComponent = (0, _connect2.default)(Component).with('A', 'B')[once ? 'mapOnce' : 'map'](function (A, B) {
    mapping(A, B);
    return {
      stateA: A.state.name,
      stateB: B.state.name,
      run: A.run,
      fetch: B.fetch
    };
  });
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
    wrapper = getWrapper();
  });
  describe('when connecting a component', function () {
    it('should call our mapping function', function () {
      expect(mapping).to.be.calledOnce;
    });
    it('should map machines state and actions properly', function () {
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });
    it('should get re-rendered if a machine\'s state is changed', function () {
      var runButton = wrapper.find('button#run');
      var fetchButton = wrapper.find('button#fetch');

      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      runButton.simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      expect(runButton.simulate.bind(runButton, 'click')).to.throw('"run" action is not available in "running" state');

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
  });
  describe('when unmounting the component', function () {
    it('should detach from the machines', function () {
      _.Machine.get('A').run();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      _.Machine.get('A').stop();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      wrapper.unmount();
      _.Machine.get('A').run();
      expect(mapping.callCount).to.be.equal(3);
    });
  });
});