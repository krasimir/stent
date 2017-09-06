'use strict';

exports.__esModule = true;
exports.default = connect;

var _ = require('../');

var idIndex = 0;
var getId = function getId() {
  return 'm' + ++idIndex;
};

function connect() {
  var mappings = {};

  _.Machine.addMiddleware({
    onStateChange: function onStateChange(next) {
      next();
      for (var id in mappings) {
        var _mappings$id;

        (_mappings$id = mappings[id]).done.apply(_mappings$id, mappings[id].machines);
      }
    }
  });
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var machines = names.map(function (name) {
      return _.Machine.get(name);
    });
    var mapFunc = function mapFunc(done, once) {
      var id = getId();

      !once && (mappings[id] = { done: done, machines: machines });
      done.apply(undefined, machines);

      return function () {
        if (mappings && mappings[id]) delete mappings[id];
      };
    };

    return {
      'map': mapFunc,
      'mapOnce': function mapOnce(done) {
        return mapFunc(done, true);
      }
    };
  };

  return { 'with': withFunc };
}
module.exports = exports['default'];