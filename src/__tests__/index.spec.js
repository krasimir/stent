import { Machine } from '../';
import { ERROR_MISSING_MACHINE } from '../constants';
import { call } from '../helpers';

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
    describe('and we have a middleware attached', function () {
      it('should trigger the middleware hook', function () {
        const spy = sinon.spy();

        Machine.addMiddleware({
          onMachineCreated: spy
        });
        create('xxxa');

        expect(spy).to.be.calledOnce.and.to.be.calledWith(sinon.match({ name: 'xxxa'}));
      });
    });
  });
  describe('when `getting a machine', function () {
    it('should return the machine if it exists', function () {
      create('bar');
      const foo = create('foo');

      expect(Machine.get('bar').name).to.equal('bar');
      expect(Machine.get(foo).name).to.equal('foo');
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
  describe('when we fire two actions one after each other', function () {
    describe('and we use the .latest version of the action', function () {
      it('should cancel the first action and only work with the second one', 
      function (done) {
        const backend = sinon.stub();
        backend.withArgs('s').returns('salad');
        backend.withArgs('st').returns('stent');

        const api = function (char) {
          return new Promise(resolve => {
            setTimeout(() => resolve(backend(char)), 10);
          });
        }

        const machine = Machine.create({
          state: { name: 'x' },
          transitions: {
            x: {
              type: function * (state, letter) {
                const match = yield call(api, letter);

                return { name: 'y', match };
              }
            },
            y: {
              'noway': 'x'
            }
          }
        });

        machine.type.latest('s');
        machine.type.latest('st');

        setTimeout(function () {
          expect(machine.state).to.deep.equal({ name: 'y', match: 'stent' });
          done();
        }, 20);
      });
    });
  });
  describe('when using the `destroy` method', function () {
    it('should delete the machine', function () {
      Machine.create('foo', { state: {}, transitions: {} });
      const B = Machine.create('bar', { state: {}, transitions: {} });

      expect(typeof Machine.machines.foo).to.equal('object');
      Machine.destroy('foo');
      expect(typeof Machine.machines.foo).to.equal('undefined');

      expect(typeof Machine.machines.bar).to.equal('object');
      Machine.destroy(B);
      expect(typeof Machine.machines.bar).to.equal('undefined');
    });
    describe('and the machine does not exist', function () {
      it('should throw an error', function () {
        expect(Machine.destroy.bind(Machine, 'foo')).to.throw('foo');
      });
    });
  });
});

