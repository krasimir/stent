'use strict';

exports.__esModule = true;
exports.default = handleMiddleware;

var _ = require('../');

function handleMiddleware(hook, machine) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var middlewares = _.Machine.middlewares;

  if (middlewares.length === 0) {
    return;
  }

  var loop = function loop(index, process) {
    return index < middlewares.length - 1 ? process(index + 1) : null;
  };

  (function process(index) {
    var middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, args);
    }
    loop(index, process);
  })(0);
}
module.exports = exports['default'];