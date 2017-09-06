import { Machine } from '../../'
import connect from '../connect';

describe('Given the connect middleware', function () {
  describe('when connecting with state machines', function () {
    it.skip('should get the mapping function called once', function () {
      const machine = {
        state: { name: 'idle' },
        transitions: {
          idle: { run: 'running' },
          running: { stop: 'idle' }
        },
        [MIDDLEWARE_STORAGE]: [ connect ]
      };
    });
  });
});