'use strict';

exports.__esModule = true;
exports.flush = flush;
exports.default = connect;

var _ = require('../');

var idIndex = 0;
var mappings = null;

var getId = function getId() {
  return 'm' + ++idIndex;
};
var setup = function setup() {
  if (mappings !== null) return;
  mappings = {};
  _.Machine.addMiddleware({
    onStateChange: function onStateChange(next) {
      next();
      for (var id in mappings) {
        var _mappings$id;

        mappings[id].done && (_mappings$id = mappings[id]).done.apply(_mappings$id, mappings[id].machines);
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
        if (mappings && mappings[id]) delete mappings[id];
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
}