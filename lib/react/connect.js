'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (Component) {
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var mapFunc = function mapFunc(done, once, silent) {
      var mapping = once ? "mapOnce" : silent ? "mapSilent" : "map";

      return function (_React$Component) {
        _inherits(StentConnect, _React$Component);

        function StentConnect(props) {
          var _connect;

          _classCallCheck(this, StentConnect);

          var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

          _this.initialStateHasBeenSet = false;
          _this.state = {};

          _this.disconnect = (_connect = (0, _connect3.default)({
            meta: { component: Component.name }
          })).with.apply(_connect, names)[mapping](function () {
            var nextState = done ? done.apply(undefined, arguments) : {};

            if (_this.initialStateHasBeenSet === false && mapping !== 'mapSilent') {
              _this.state = nextState;
              _this.initialStateHasBeenSet = true;
              return;
            }

            _this.setState(function () {
              return nextState;
            });
          });
          return _this;
        }

        StentConnect.prototype.componentWillUnmount = function componentWillUnmount() {
          if (this.disconnect) {
            this.disconnect();
          }
        };

        StentConnect.prototype.render = function render() {
          return _react2.default.createElement(Component, _extends({}, this.state, this.props));
        };

        return StentConnect;
      }(_react2.default.Component);
    };

    return {
      'map': mapFunc,
      'mapOnce': function mapOnce(done) {
        return mapFunc(done, true);
      },
      'mapSilent': function mapSilent(done) {
        return mapFunc(done, false, true);
      }
    };
  };

  return { 'with': withFunc };
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _connect2 = require('../helpers/connect');

var _connect3 = _interopRequireDefault(_connect2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = exports['default'];