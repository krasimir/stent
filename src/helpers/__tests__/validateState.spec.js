import validateState from '../validateState';
import { ERROR_WRONG_STATE_FORMAT } from '../../constants';

describe('Given the validateState helper', function () {
  describe('when using validateState', function () {
    it('throw an error if the state has no "name" property inside', function () {
      [
        { answer: 42 },
        null,
        undefined,
        'a string',
        42
      ].forEach(state => {
        expect(validateState.bind(null, state)).to.throw(ERROR_WRONG_STATE_FORMAT(state));
      });
    });
  });
});