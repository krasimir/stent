'use strict';

exports.__esModule = true;
exports.flush = flush;
exports.default = connect;

var _ = require('../');

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var idIndex = 0;
var mappings = null;

var getId = function getId() {
  return 'm' + ++idIndex;
};
var setup = function setup() {
  if (mappings !== null) return;
  mappings = {};
  _.Machine.addMiddleware({
    onStateChanged: function onStateChanged() {
      for (var id in mappings) {
        var _mappings$id = mappings[id],
            done = _mappings$id.done,
            machines = _mappings$id.machines;


        if (machines.map(function (m) {
          return m.name;
        }).indexOf(this.name) >= 0) {
          done && done.apply(undefined, machines);
        }
      }
    }
  });
};

function flush() {
  mappings = null;
}

function connect() {
  setup();
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var machines = names.map(function (name) {
      return _.Machine.get(name);
    });
    var mapFunc = function mapFunc(done, once, silent) {
      var id = getId();

      !once && (mappings[id] = { done: done, machines: machines });
      !silent && done && done.apply(undefined, machines);

      return function disconnect() {
        (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_DISCONNECTED, null, machines);
        if (mappings && mappings[id]) delete mappings[id];
      };
    };

    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_CONNECTED, null, machines);
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
}