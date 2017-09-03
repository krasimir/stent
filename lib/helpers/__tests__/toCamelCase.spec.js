'use strict';

var _toCamelCase = require('../toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the toCamelCase helper', function () {
  describe('when using toCamelCase', function () {
    it('should transform a given string to a camel case', function () {
      [['run', 'run'], ['a b', 'aB'], ['a b c', 'aBC'], ['the answer is 42', 'theAnswerIs42'], ['Hello World', 'helloWorld'], ['get-data-from-there', 'getDataFromThere'], ['another_mixed example-of^% a method', 'another_mixedExampleOfAMethod']].forEach(function (testCase) {
        expect((0, _toCamelCase2.default)(testCase[0])).to.equal(testCase[1]);
      });
    });
  });
});