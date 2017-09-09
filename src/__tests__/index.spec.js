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
  describe('when creating a machine without a name', function () {
    it('should be possible to fetch it by using the machine itself or the its generated name', function () {
      const machine = Machine.create({
        state: { name: 'idle' },
        transitions: { idle: { run: 'running' } }
      });

      expect(Machine.get(machine).state.name).to.equal('idle');
      expect(Machine.get(machine.name).state.name).to.equal('idle');
    });
  });
});