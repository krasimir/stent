import toCamelCase from '../toCamelCase';

describe('Given the toCamelCase helper', function () {
  describe('when using toCamelCase', function () {
      [
        ['run', 'run'],
        ['a b', 'aB'],
        ['a b c', 'aBC'],
        ['the answer is 42', 'theAnswerIs42'],
        ['Hello World', 'helloWorld'],
        ['get-data-from-there', 'getDataFromThere'],
        ['another_mixed example-of^% a method', 'another_mixedExampleOfAMethod'],,
        ['startProcess', 'startProcess'],
        ['start Pro ceSs', 'startProCeSs'],
      ].forEach(testCase => {
        it(`should transform "${ testCase[0] }" to "${ testCase[1] }"`, function () {
          expect(toCamelCase(testCase[0])).to.equal(testCase[1]);
        });
      });
  });
});