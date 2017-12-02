'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ = require('../');

var _constants = require('../constants');

var _helpers = require('../helpers');

var create = function create() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'app';
  return _.Machine.create(name, {
    state: { idle: { run: 'running' } },
    transitions: {}
  });
};

describe('Given the Stent library', function () {
  beforeEach(function () {
    _.Machine.flush();
  });
  describe('when creating a new machine', function () {
    it('should have the machine with its name set up', function () {
      expect(create('foo').name).to.equal('foo');
    });
    describe('and we have a middleware attached', function () {
      it('should trigger the middleware hook', function () {
        var spy = sinon.spy();

        _.Machine.addMiddleware({
          onMachineCreated: spy
        });
        create('xxxa');

        expect(spy).to.be.calledOnce.and.to.be.calledWith(sinon.match({ name: 'xxxa' }));
      });
      it('should call the onMiddlewareRegister hook if available', function () {
        var spy = sinon.spy();

        _.Machine.addMiddleware({
          onMiddlewareRegister: spy
        });
        _.Machine.addMiddleware({
          onMiddlewareRegister: spy
        });

        expect(spy).to.be.calledTwice;
      });
    });
  });
  describe('when `getting a machine', function () {
    it('should return the machine if it exists', function () {
      create('bar');
      var foo = create('foo');

      expect(_.Machine.get('bar').name).to.equal('bar');
      expect(_.Machine.get(foo).name).to.equal('foo');
    });
    it('should throw an error if the machine does not exist', function () {
      create('bar');

      expect(_.Machine.get.bind(_.Machine, 'baz')).to.throw((0, _constants.ERROR_MISSING_MACHINE)('baz'));
    });
  });
  describe('when creating a machine without a name', function () {
    it('should be possible to fetch it by using the machine itself or the its generated name', function () {
      var machine = _.Machine.create({
        state: { name: 'idle' },
        transitions: { idle: { run: 'running' } }
      });

      expect(_.Machine.get(machine).state.name).to.equal('idle');
      expect(_.Machine.get(machine.name).state.name).to.equal('idle');
    });
  });
  describe('when we fire two actions one after each other', function () {
    describe('and we use the .latest version of the action', function () {
      it('should cancel the first action and only work with the second one', function (done) {
        var backend = sinon.stub();
        backend.withArgs('s').returns('salad');
        backend.withArgs('st').returns('stent');

        var api = function api(char) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              return resolve(backend(char));
            }, 10);
          });
        };

        var machine = _.Machine.create({
          state: { name: 'x' },
          transitions: {
            x: {
              type: /*#__PURE__*/regeneratorRuntime.mark(function type(state, letter) {
                var match;
                return regeneratorRuntime.wrap(function type$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return (0, _helpers.call)(api, letter);

                      case 2:
                        match = _context.sent;
                        return _context.abrupt('return', { name: 'y', match: match });

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, type, this);
              })
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
      _.Machine.create('foo', { state: {}, transitions: {} });
      var B = _.Machine.create('bar', { state: {}, transitions: {} });

      expect(_typeof(_.Machine.machines.foo)).to.equal('object');
      _.Machine.destroy('foo');
      expect(_typeof(_.Machine.machines.foo)).to.equal('undefined');

      expect(_typeof(_.Machine.machines.bar)).to.equal('object');
      _.Machine.destroy(B);
      expect(_typeof(_.Machine.machines.bar)).to.equal('undefined');
    });
    describe('and the machine does not exist', function () {
      it('should throw an error', function () {
        expect(_.Machine.destroy.bind(_.Machine, 'foo')).to.throw('foo');
      });
    });
  });
});