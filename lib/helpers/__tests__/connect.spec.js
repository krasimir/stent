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
    it('should add only one middleware', function () {
      var mappingA = sinon.spy();
      var mappingB = sinon.spy();
      var machine = _.Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });

      (0, _connect2.default)().with('A').map(mappingA);
      (0, _connect2.default)().with('A').map(mappingB);
      (0, _connect2.default)().with(machine).map(mappingB);

      expect(_.Machine.middlewares.length).to.be.equal(1);
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

        expect(mapping).to.be.calledOnce;
        expect(mapping.firstCall).to.be.calledWith(sinon.match('idle'));
      });
    });
    describe('and we use `mapSilent`', function () {
      it('should fire the mapping only when the machine changes its state', function () {
        var mapping = sinon.spy();
        var machine = _.Machine.create('A', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { jump: 'jumping' },
            jumping: { stop: 'idle' }
          }
        });

        (0, _connect2.default)().with('A').mapSilent(function (A) {
          mapping(A.state.name);
        });

        machine.run();
        machine.jump();

        expect(mapping).to.be.calledTwice;
        expect(mapping.firstCall).to.be.calledWith(sinon.match('running'));
        expect(mapping.secondCall).to.be.calledWith(sinon.match('jumping'));
      });
    });
    describe('and we pass no mapping function', function () {
      it('should still do the connecting', function () {
        var machine = _.Machine.create('A', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { stop: 'idle' }
          }
        });

        (0, _connect2.default)().with('A').map();

        machine.run();

        expect(machine.state).to.deep.equal({ name: 'running' });
      });
    });
    describe('and we have two mappers', function () {
      it('should call them only if the machine that they are connected transitions', function () {
        var machineA = _.Machine.create('A', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { stop: 'idle' }
          }
        });
        var machineB = _.Machine.create('B', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { stop: 'idle' }
          }
        });
        var spyA = sinon.spy();
        var spyB = sinon.spy();

        (0, _connect2.default)().with('A').mapSilent(spyA);
        (0, _connect2.default)().with('B').mapSilent(spyB);

        machineA.run();

        expect(spyA).to.be.calledOnce;
        expect(spyB).to.not.be.called;
      });
    });
  });
  describe('when we use the `disconnect` function', function () {
    it('should detach the mapping', function () {
      var mapping = sinon.spy();
      var machine = _.Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });
      var disconnect = (0, _connect2.default)().with('A').map(function (A) {
        mapping(A.state.name);
      });

      machine.run();
      disconnect();
      machine.stop();

      expect(mapping).to.be.calledTwice;
      expect(mapping.firstCall).to.be.calledWith(sinon.match('idle'));
      expect(mapping.secondCall).to.be.calledWith(sinon.match('running'));
    });
  });
});