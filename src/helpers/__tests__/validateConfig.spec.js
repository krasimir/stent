import validateConfig from '../validateConfig';
import { ERROR_MISSING_STATE, ERROR_MISSING_TRANSITIONS } from '../../constants';

describe('Given the validateConfig helper function', function () {

  describe('when validating config', function () {
    it('should throw errors if state or transitions are missing', function () {
      expect(validateConfig.bind(null, { transitions: {} })).to.throw(ERROR_MISSING_STATE);
      expect(validateConfig.bind(null, { state: {} })).to.throw(ERROR_MISSING_TRANSITIONS);
      expect(validateConfig({ state: {}, transitions: {} })).to.equal(true);
    });
  });

});