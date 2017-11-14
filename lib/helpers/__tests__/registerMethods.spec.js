'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _registerMethods = require('../registerMethods');

var _registerMethods2 = _interopRequireDefault(_registerMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Given the registerMethods helper', function () {

  describe('when registering methods', function () {
    it('should create methods dynamically (based on states and actions)', function () {
      var machine = {};

      (0, _registerMethods2.default)(machine, { 'idle': { run: 'running' }, 'running': { stop: 'idle' } }, sinon.spy(), sinon.spy());

      expect(_typeof(machine.isIdle)).to.be.equal('function');
      expect(_typeof(machine.isRunning)).to.be.equal('function');
      expect(_typeof(machine.run)).to.be.equal('function');
      expect(_typeof(machine.stop)).to.be.equal('function');
      expect(_typeof(machine.run.latest)).to.be.equal('function');
      expect(_typeof(machine.stop.latest)).to.be.equal('function');
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
  });
});