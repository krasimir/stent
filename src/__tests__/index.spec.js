import { Machine } from '../';
import { ERROR_MISSING_MACHINE, MIDDLEWARE_STORAGE } from '../constants';

const create = (name = 'app') => Machine.create(name, {
  state: { idle: { run: 'running' } },
  transitions: {}
})

describe('Given the Stent library', function () {
  beforeEach(() => {
    Machine.flush();
  });
  describe('when creating a new machine', function () {
    it('should have the machine with its name set up', function () {
      expect(create('foo').name).to.equal('foo');
    });
  });
  describe('when `get`ing a machine', function () {
    it('should return the machine if it exists', function () {
      create('bar');

      expect(Machine.get('bar').name).to.equal('bar');
    });
    it('should throw an error if the machine does not exist', function () {
      create('bar');

      expect(Machine.get.bind(Machine, 'baz')).to.throw(ERROR_MISSING_MACHINE('baz'));
    });
  });
  describe('when adding middlewares', function () {
    it('should send the middlewares to every new machine', function () {
      const middlewareA = {};
      const middlewareB = {};

      Machine.addMiddleware(middlewareA);
      Machine.addMiddleware(middlewareB);

      const machine = Machine.create('app', {
        state: { idle: { run: 'running' } },
        transitions: {}
      });

      expect(machine[MIDDLEWARE_STORAGE]).to.deep.equal([
        middlewareA, middlewareB
      ]);
    });
  });
});