import handleActionLatest from '../handleActionLatest';
import { call } from '../';

describe('Given the handleActionLatest helper', function () {
  describe('and we fire same action twice within the same state', function () {
    it.only('should kill the first generator and its processes leaving only the new one working', function (done) {
      const timeouts = [20, 10];
      const results = ['foo', 'bar'];
      const apiPromise = function() {
        return new Promise(resolve => {
          const result = results.shift();

          setTimeout(() => resolve(result), timeouts.shift());
        });
      }
      const api = function * () {
        return { name: yield call(apiPromise) };
      }
      const handler = function * () {
        return yield call(api, 'stent');
      }
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: handler },
          'foo': 'a',
          'bar': 'a'
        }
      };

      handleActionLatest(machine, 'run');
      handleActionLatest(machine, 'run');

      setTimeout(() => {
        expect(machine.state.name).to.equal('bar');
        done();
      }, 100);
    })
  });
});