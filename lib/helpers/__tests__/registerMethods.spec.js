'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _registerMethods = require('../registerMethods');

var _registerMethods2 = _interopRequireDefault(_registerMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the registerMethods helper', function () {

  describe('when registering methods', function () {
    it('should create methods dynamically (based on states and actions)', function () {
      var machine = {};

      (0, _registerMethods2.default)(machine, {
        'idle': {
          'run baby run': 'running'
        },
        'running': {
          'stop': 'idle'
        }
      }, sinon.spy(), sinon.spy());

      expect(_typeof(machine.isIdle)).to.be.equal('function');
      expect(_typeof(machine.isRunning)).to.be.equal('function');
      expect(_typeof(machine.runBabyRun)).to.be.equal('function');
      expect(_typeof(machine.stop)).to.be.equal('function');
      expect(_typeof(machine.runBabyRun.latest)).to.be.equal('function');
      expect(_typeof(machine.stop.latest)).to.be.equal('function');
      expect(_typeof(machine.isRunBabyRunAllowed)).to.be.equal('function');
      expect(_typeof(machine.isStopAllowed)).to.be.equal('function');
    });
    it('should dispatch an action with the given payload', function () {
      var dispatch = sinon.spy();
      var dispatchLatest = sinon.spy();
      var machine = {};
      var payload1 = { answer: 42 };
      var payload2 = 'foo';

      (0, _registerMethods2.default)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, dispatch, dispatchLatest);

      machine.run(payload1, payload2);
      machine.run.latest(payload2, payload1);

      expect(dispatch).to.be.calledOnce.and.to.be.calledWith('run', payload1, payload2);
      expect(dispatchLatest).to.be.calledOnce.and.to.be.calledWith('run', payload2, payload1);
    });
    it('should check if the machine is in a particular state', function () {
      var machine = { state: { name: 'running' } };

      (0, _registerMethods2.default)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, sinon.spy(), sinon.spy());

      expect(machine.isIdle()).to.be.false;
      expect(machine.isRunning()).to.be.true;
    });
    it('should check if particular transition is allowed', function () {
      var machine = { state: { name: 'running' } };

      (0, _registerMethods2.default)(machine, {
        'idle': {
          run: 'running'
        },
        'running': {
          stop: 'idle'
        }
      }, sinon.spy(), sinon.spy());

      expect(machine.isStopAllowed()).to.be.true;
      expect(machine.isRunAllowed()).to.be.false;

      machine.state.name = 'idle';

      expect(machine.isStopAllowed()).to.be.false;
      expect(machine.isRunAllowed()).to.be.true;
    });
    describe('when some of the transitions match the word `name`, `transition` or `state`', function () {
      var register = function register(state) {
        return (0, _registerMethods2.default)({}, state, sinon.spy(), sinon.spy());
      };
      ['name', 'transitions', 'state', 'destroy'].forEach(function (word) {
        it('should throw an error if ' + word + ' is used', function () {
          var _idle;

          expect(register.bind(null, { 'idle': (_idle = {}, _idle[word] = 'foo', _idle) })).to.throw('It is reserved.');
        });
      });
    });
  });
});