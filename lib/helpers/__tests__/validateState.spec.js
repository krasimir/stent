'use strict';

var _validateState = require('../validateState');

var _validateState2 = _interopRequireDefault(_validateState);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the validateState helper', function () {
  describe('when using validateState', function () {
    it('throw an error if the state has no "name" property inside', function () {
      [{ answer: 42 }, null, undefined, 'a string', 42].forEach(function (state) {
        expect(_validateState2.default.bind(null, state)).to.throw((0, _constants.ERROR_WRONG_STATE_FORMAT)(state));
      });
    });
  });
});