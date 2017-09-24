import { Machine } from '../../';
import { Logger } from '../';

describe('Given the Logger middleware', function () {
  describe('when using Logger', function () {
    before(() => {
      sinon.stub(console, 'log');
    });
    after(() => {
      console.log.restore();
      Machine.flush();
    });
    it('should log to the console', function () {
      Machine.addMiddleware(Logger);

      const machine = Machine.create(
        { name: 'idle' },
        {
          idle: {
            run: function () {
              return 'running'
            }
          },
          running: {
            stop: 'idle'
          }
        }
      );

      machine.run({}, 42, 'hello world');
      machine.stop();

      expect(console.log.callCount).to.be.equal(4);
      expect(console.log.getCall(0)).to.be.calledWith(
        `${ machine.name }: "run" dispatched with payload [object Object],42,hello world`
      );
      expect(console.log.getCall(1)).to.be.calledWith(
        `${ machine.name }: state changed to "running"`
      );
      expect(console.log.getCall(2)).to.be.calledWith(
        `${ machine.name }: "stop" dispatched`
      );
      expect(console.log.getCall(3)).to.be.calledWith(
        `${ machine.name }: state changed to "idle"`
      );
    });
  });
});