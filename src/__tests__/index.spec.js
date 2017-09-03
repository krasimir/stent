import { Machine } from '../';
import { ERROR_MISSING_MACHINE } from '../constants';

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
});