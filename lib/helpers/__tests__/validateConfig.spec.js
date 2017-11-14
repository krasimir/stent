'use strict';

var _validateConfig = require('../validateConfig');

var _validateConfig2 = _interopRequireDefault(_validateConfig);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the validateConfig helper function', function () {

  describe('when validating config', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(_validateConfig2.default.bind(null, { transitions: {} })).to.throw(_constants.ERROR_MISSING_STATE);
      expect(_validateConfig2.default.bind(null, { state: {} })).to.throw(_constants.ERROR_MISSING_TRANSITIONS);
      expect((0, _validateConfig2.default)({ state: {}, transitions: {} })).to.equal(true);
    });
  });
});