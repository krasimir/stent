import { Machine } from '../../';
import { Logger } from '../';
import { call } from '../../helpers';

describe('Given the Logger middleware', function () {
  beforeEach(() => {
    sinon.stub(console, 'log');
    Machine.addMiddleware(Logger);
  });
  afterEach(() => {
    console.log.restore();
    Machine.flush();
  });
  describe('when using Logger with function and string as a handler', function () {
    it('should log to the console', function () {
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
      [
        `${ machine.name }: "run" dispatched with payload {},42,hello world`,
        `${ machine.name }: state changed to "running"`,
        `${ machine.name }: "stop" dispatched`,
        `${ machine.name }: state changed to "idle"`
      ].forEach((logStr, i) => {
        expect(console.log.getCall(i)).to.be.calledWith(logStr);
      });

    });
  });
  describe('when using the Logger with a generator function', function () {
    it('should log every step of the generator', function () {
      const myFunc = () => ({ name: 'running' });
      const machine = Machine.create(
        { name: 'idle' },
        {
          idle: {
            run: function * () {
              yield 'running';
              yield { name: 'running' };
              yield call(myFunc, 42);
              return 'running'
            }
          },
          running: {
            stop: 'idle'
          }
        }
      );

      machine.run({ foo: 'bar' }, 42, 'hello world');
      machine.stop();

      expect(console.log.callCount).to.be.equal(10);
      [
        `${ machine.name }: "run" dispatched with payload {"foo":"bar"},42,hello world`,
        `${ machine.name }: generator step -> running`,
        `${ machine.name }: state changed to "running"`,
        `${ machine.name }: generator step -> {"name":"running"}`,
        `${ machine.name }: state changed to "running"`,
        `${ machine.name }: generator step -> {"__type":"call","args":[42]}`,
        `${ machine.name }: generator step -> running`,
        `${ machine.name }: state changed to "running"`,
        `${ machine.name }: "stop" dispatched`,
        `${ machine.name }: state changed to "idle"`
      ].forEach((logStr, i) => {
        expect(console.log.getCall(i)).to.be.calledWith(logStr);
      });
    });
  })
});