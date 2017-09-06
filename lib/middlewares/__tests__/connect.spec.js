'use strict';

var _ = require('../../');

var _connect = require('../connect');

var _connect2 = _interopRequireDefault(_connect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the connect middleware', function () {
  describe('when connecting with state machines', function () {
    it.skip('should get the mapping function called once', function () {
      var _machine;

      var machine = (_machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      }, _machine[MIDDLEWARE_STORAGE] = [_connect2.default], _machine);
    });
  });
});