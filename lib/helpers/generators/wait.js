'use strict';

exports.__esModule = true;
exports.default = wait;
function wait() {
  for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
    actions[_key] = arguments[_key];
  }

  if (actions.length === 1) {
    actions = actions[0];
    if (!Array.isArray(actions)) actions = [actions];
  }
  return { __type: 'wait', actions: actions };
};
module.exports = exports['default'];