import connect from '../connect';
import { Machine } from '../../';

describe('Given the connect helper', function () {
  beforeEach(() => {
    Machine.flush();
  });
  describe('when using connect', function () {
    it('should allow mapping to machines', function (done) {
      Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });
      Machine.create('B', {
        state: { name: 'waiting' },
        transitions: {
          waiting: { fetch: 'fetching' },
          fetching: { done: 'waiting' }
        }
      });
      connect()
        .with('A', 'B')
        .map((A, B) => {

          expect(A.state.name).to.equal('idle');
          expect(B.state.name).to.equal('waiting');
          done();
        });
    });
    describe('and when we update the state of the mapped machine/s', function () {
      it('should fire the mapping function', function () {
        const mapping = sinon.spy();
        const machine = Machine.create('A', {
          state: { name: 'idle' },
          transitions: {
            idle: { run: 'running' },
            running: { stop: 'idle' }
          }
        });

        connect().with('A').map(A => {
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
      const mapping = sinon.spy();
      const machine = Machine.create('A', {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        }
      });

      connect().with('A').mapOnce(A => {
        mapping(A.state.name);
      });

      machine.run();
      machine.stop();

      expect(mapping).to.be.Once;
      expect(mapping.firstCall).to.be.calledWith(sinon.match('idle'));
    });
  });
});