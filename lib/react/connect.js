'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (Component) {
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var mapFunc = function mapFunc(done, once, silent) {
      var _connect;

      var mapping = 'map';
      var dependencies = {};
      var listener = function listener() {};

      if (once) mapping = 'mapOnce';
      if (silent) mapping = 'mapSilent';

      var disconnect = (_connect = (0, _connect3.default)({
        meta: { component: Component.name }
      })).with.apply(_connect, names)[mapping](function () {
        if (done) {
          listener(dependencies = done.apply(undefined, arguments));
        } else {
          listener({});
        }
      });
      return function StentConnect(props) {
        var _useState = (0, _react.useState)(dependencies),
            state = _useState[0],
            setState = _useState[1];

        (0, _react.useEffect)(function () {
          listener = setState;
          return function () {
            disconnect();
          };
        }, []);

        return _react2.default.createElement(Component, _extends({}, state, props));
      };
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

module.exports = exports['default'];