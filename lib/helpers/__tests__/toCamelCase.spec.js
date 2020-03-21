'use strict';

var _toCamelCase = require('../toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the toCamelCase helper', function () {
  describe('when using toCamelCase', function () {
    [['run', 'run'], ['a b', 'aB'], ['a b c', 'aBC'], ['the answer is 42', 'theAnswerIs42'], ['Hello World', 'helloWorld'], ['get-data-from-there', 'getDataFromThere'], ['another_mixed example-of^% a method', 'anotherMixedExampleOfAMethod'], ['startProcess', 'startProcess'], ['start Pro ceSs', 'startProCeSs'], ['/initializing', 'initializing'], ['/initializing/', 'initializing'], ['/initializing/stage-one', 'initializingStageOne'], ['/initializing/stage_one', 'initializingStageOne']].forEach(function (testCase) {
      it('should transform "' + testCase[0] + '" to "' + testCase[1] + '"', function () {
        expect((0, _toCamelCase2.default)(testCase[0])).to.equal(testCase[1]);
      });
    });
  });
});