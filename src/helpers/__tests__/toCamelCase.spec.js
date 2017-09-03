import toCamelCase from '../toCamelCase';

describe('Given the helpers', function () {
  describe('when using toCamelCase', function () {
    it('should transform a given string to a camel case', function () {
      [
        ['run', 'run'],
        ['a b', 'aB'],
        ['a b c', 'aBC'],
        ['the answer is 42', 'theAnswerIs42'],
        ['Hello World', 'helloWorld'],
        ['get-data-from-there', 'getDataFromThere'],
        ['another_mixed example-of^% a method', 'another_mixedExampleOfAMethod'],
      ].forEach(testCase => {
        expect(toCamelCase(testCase[0])).to.equal(testCase[1]);
      })
    });
  });
});