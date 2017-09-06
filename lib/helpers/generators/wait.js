'use strict';

exports.__esModule = true;
exports.default = wait;
function wait(actions) {
  if (!Array.isArray(actions)) actions = [actions];
  return { __type: 'wait', actions: actions };
};
module.exports = exports['default'];