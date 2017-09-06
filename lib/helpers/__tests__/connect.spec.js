'use strict';

var _connect = require('../connect');

var _connect2 = _interopRequireDefault(_connect);

var _ = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the connect helper', function () {
  beforeEach(function () {
    _.Machine.flush();
  });
  describe('when using connect', function () {
    it('should allow mapping to machines', function (done) {
      _.Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });
      _.Machine.create('B', {
        state: { name: 'waiting' },
        transitions: {
          waiting: { fetch: 'fetching' },
          fetching: { done: 'waiting' }
        }
      });
      (0, _connect2.default)().with('A', 'B').map(function (A, B) {

        expect(A.state.name).to.equal('idle');
        expect(B.state.name).to.equal('waiting');
        done();
      });
    });
    describe('and when we update the state of the mapped machine/s', function () {
      it('should fire the mapping function', function () {
        var mapping = sinon.spy();
        var machine = _.Machine.create('A', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { stop: 'idle' }
          }
        });

        (0, _connect2.default)().with('A').map(function (A) {
          mapping(A.state.name);
        });

        machine.run();
        machine.stop();

        expect(mapping).to.be.calledThrice;
        expect(mapping.firstCall).to.be.calledWith(sinon.match('idle'));
        expect(mapping.secondCall).to.be.calledWith(sinon.match('running'));
        expect(mapping.thirdCall).to.be.calledWith(sinon.match('idle'));
      });
    });
  });
  describe('and we use `mapOnce`', function () {
    it('should fire the mapping only once', function () {
      var mapping = sinon.spy();
      var machine = _.Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });

      (0, _connect2.default)().with('A').mapOnce(function (A) {
        mapping(A.state.name);
      });

      machine.run();
      machine.stop();

      expect(mapping).to.be.Once;
      expect(mapping.firstCall).to.be.calledWith(sinon.match('idle'));
    });
  });
});