import handleGenerator from '../handleGenerator';
import { call } from '../';

describe('Given the handleGenerator helper', function () {
  describe('when we run the same generator again', function () {
    describe('and we want to cancel the first one', function () {
      it('should cancel the second generator', function (done) {
        const testCases = [
          { timeout: 20, answer: 'a'},
          { timeout: 10, answer: 'b'}
        ];
        const delay = ({ timeout, answer }) => new Promise(resolve => {
          setTimeout(() => resolve(answer), timeout);
        });
        const onGeneratorEnds = sinon.spy();
        const generator = function * () {
          return yield call(function * () {
            return yield call(() => delay(testCases.shift()));
          });
        }

        const cancel = handleGenerator({}, generator(), onGeneratorEnds);
        handleGenerator({}, generator(), onGeneratorEnds);
        cancel();

        setTimeout(function () {
          expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('b');
          done();
        }, 30);
      });
    });
  });
  
  it('should catch errors in the function result of the call helper', function () {
    const mistake = () => {
      throw new Error('oops');
    };

    const generator = function* generator() {
      try {
        yield call(mistake);
      } catch (err) {
        return err.message;
      }
    };

    handleGenerator({}, generator(), (result) =>
      expect(result).to.be.equal('oops')
    );
  });

  it('should handle synchronous functions in nested generators', function () {
    const synchronous = () => 'synchronous';

    const nestedGenerator = function* nestedGenerator () {
      return yield call(synchronous);
    };

    const generator = function* generator() {
      try {
        return yield call(nestedGenerator);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('synchronous');
  });

  it('should catch errors thrown by synchronous functions in nested generators', function () {
    const mistake = () => {
      throw new Error('oops');
    };

    const nestedGenerator = function* nestedGenerator () {
      yield call(mistake);
    };

    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(nestedGenerator);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(afterThrow.notCalled).to.be.equal(true);
    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
  });

  it('should handle asynchronous functions in nested generators', function (done) {
    const async = async () => await Promise.resolve('async');

    const nestedGenerator = function* nestedGenerator () {
      return yield call(async);
    };

    const generator = function* generator() {
      try {
        return yield call(nestedGenerator);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('async');
      done();
    }, 300);
  });

  it('should catch errors thrown by asynchronous functions in nested generators', function (done) {
    const mistake = async () => {
      throw new Error('oops');
    };

    const nestedGenerator = function* nestedGenerator () {
      yield call(mistake);
    };

    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(nestedGenerator);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    expect(afterThrow.notCalled).to.be.equal(true);

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
      done();
    }, 30);
  });

  it('should catch errors thrown by asynchronous functions in deeply nested generators', function (done) {
    const mistake = async () => {
      throw new Error('oops');
    };

    const deepGenerator = function* deepGenerator() {
      yield call(mistake);
    };

    const nestedGenerator = function* nestedGenerator () {
      yield call(deepGenerator);
    };

    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(nestedGenerator);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    expect(afterThrow.notCalled).to.be.equal(true);

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
      done();
    }, 30);
  });

  it('should catch errors thrown by synchronous functions in deeply nested generators', function () {
    const mistake = () => {
      throw new Error('oops');
    };

    const deepGenerator = function* deepGenerator() {
      yield call(mistake);
    };

    const nestedGenerator = function* nestedGenerator () {
      yield call(deepGenerator);
    };

    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(nestedGenerator);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(afterThrow.notCalled).to.be.equal(true);
    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
  });

  it('should handle synchronous functions in deeply nested generators', function () {
    const synchronous = () => 'synchronous';

    const deepGenerator = function* deepGenerator() {
      return yield call(synchronous);
    };

    const nestedGenerator = function* nestedGenerator () {
      return yield call(deepGenerator);
    };

    const generator = function* generator() {
      try {
        return yield call(nestedGenerator);
      } catch (err) {
        return err.message;
      }
    };
    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('synchronous');
  });

  it('should handle asynchronous functions in deeply nested generators', function (done) {
    const async = async () => await Promise.resolve('async');

    const deepGenerator = function* deepGenerator() {
      return yield call(async);
    };

    const nestedGenerator = function* nestedGenerator () {
      return yield call(deepGenerator);
    };

    const generator = function* generator() {
      try {
        return yield call(nestedGenerator);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('async');
      done();
    }, 300);
  });

  it('should handle asynchronous functions', function (done) {
    const async = async () => await Promise.resolve('async');

    const generator = function* generator() {
      try {
        return yield call(async);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('async');
      done();
    }, 300);
  });

  it('should catch errors in asynchronous functions', function (done) {
    const mistake = async () => {
      throw new Error('oops');
    };
    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(mistake);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    setTimeout(function () {
      expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
      expect(afterThrow.notCalled).to.be.equal(true);

      done();
    }, 300);
  });

  it('should handle synchronous functions', function () {
    const synchronous = () => 'synchronous';

    const generator = function* generator() {
      try {
        return yield call(synchronous);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('synchronous');
  });

  it('should catch errors thrown by synchronous functions', function () {
    const mistake = () => {
      throw new Error('oops');
    };

    const afterThrow = sinon.spy();

    const generator = function* generator() {
      try {
        yield call(mistake);
        yield call(afterThrow);
      } catch (err) {
        return err.message;
      }
    };

    const onGeneratorEnds = sinon.spy();

    handleGenerator({}, generator(), onGeneratorEnds);

    expect(afterThrow.notCalled).to.be.equal(true);
    expect(onGeneratorEnds).to.be.calledOnce.and.to.be.calledWith('oops');
  }); 
});