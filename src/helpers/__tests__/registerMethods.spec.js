import registerMethods from '../registerMethods';

describe('Given the registerMethods helper', function () {

  describe('when registering methods', function () {
    it('should create methods dynamically (based on states and actions)', function () {
      const machine = {};

      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        sinon.spy(),
        sinon.spy()
      );
      
      expect(typeof machine.isIdle).to.be.equal('function');
      expect(typeof machine.isRunning).to.be.equal('function');
      expect(typeof machine.run).to.be.equal('function');
      expect(typeof machine.stop).to.be.equal('function');
      expect(typeof machine.run.latest).to.be.equal('function');
      expect(typeof machine.stop.latest).to.be.equal('function');
    });
    it('should dispatch an action with the given payload', function () {
      const dispatch = sinon.spy();
      const dispatchLatest = sinon.spy();
      const machine = {};
      const payload1 = { answer: 42 };
      const payload2 = 'foo'
  
      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        dispatch,
        dispatchLatest
      );
      
      machine.run(payload1, payload2);
      machine.run.latest(payload2, payload1);

      expect(dispatch).to.be.calledOnce.and.to.be.calledWith('run', payload1, payload2);
      expect(dispatchLatest).to.be.calledOnce.and.to.be.calledWith('run', payload2, payload1);
    });
    it('should check if the machine is in a particular state', function () {
      const machine = { state: { name: 'running' }};
  
      registerMethods(
        machine,
        { 'idle': { run: 'running' }, 'running': { stop: 'idle' } },
        sinon.spy(),
        sinon.spy()
      );

      expect(machine.isIdle()).to.be.false;
      expect(machine.isRunning()).to.be.true;
    });
  });

});