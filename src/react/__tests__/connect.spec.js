import React from 'react';
import { Machine } from '../../';
import connect from '../connect';
import { mount } from 'enzyme';

var wrapper;
const mapping = sinon.spy();

class Component extends React.Component {
  render() {
    return (
      <div>
        <p id='A'>{ this.props.message('machine A', this.props.stateA)}</p>
        <p id='B'>{ this.props.message('machine B', this.props.stateB)}</p>
        <button id='run' onClick={ () => this.props.run() }>run</button>
        <button id='fetch' onClick={ () => this.props.fetch() }>fetch</button>
      </div>
    );
  }
}

function getWrapper(once, m) {
  const mappingFunc = (A, B) => {
    mapping(A, B);
    return {
      stateA: A.state.name,
      stateB: B.state.name,
      run: A.run,
      fetch: B.fetch
    }
  };
  const ConnectedComponent = connect(Component)
    .with('A', 'B')
    [once ? 'mapOnce' : 'map'](typeof m === 'undefined' ? mappingFunc : m);
  const message = (machineName, state) => `${ machineName } is in a ${ state } state`;
  
  return mount(<ConnectedComponent message={ message } />);
}

describe('Given the connect React helper', function () {
  beforeEach(() => {
    mapping.reset();
    Machine.flush();
    Machine.create('A', {
      state: { name: 'idle' },
      transitions: {
        idle: { run: 'running' },
        running: { stop: 'idle' }
      }
    });
    Machine.create('B', {
      state: { name: 'waiting' },
      transitions: {
        waiting: { fetch: 'fetching' },
        fetching: { done: 'waiting' }
      }
    });
  });
  describe('when connecting a component', function () {
    it('should call our mapping function', function () {
      wrapper = getWrapper();
      expect(mapping).to.be.calledOnce;
    });
    it('should map machines state and actions properly', function () {
      wrapper = getWrapper();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });
    it('should get re-rendered if a machine\'s state is changed', function () {
      wrapper = getWrapper();
      const runButton = wrapper.find('button#run');
      const fetchButton = wrapper.find('button#fetch');

      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      runButton.simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      runButton.simulate('click');
      runButton.simulate('click');
      runButton.simulate('click');

      fetchButton.simulate('click');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a fetching state');
    });
    it('should NOT get re-rendered if mapped with `mapOnce`', function () {
      wrapper = getWrapper(true);
      wrapper.find('button#run').simulate('click');
      wrapper.find('button#fetch').simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });

    describe('when we update the state of the machine many times in a single frame', function () {
      it('should trigger the mapping function many times', function () {
        const render = sinon.spy();
        const Comp = function () {
          render();
          return <p>Hello</p>;
        }
        const machine = Machine.create('C', {
          state: { name: 'idle', counter: 0 },
          transitions: {
            idle: {
              run: function ({ counter }) {
                return { name: 'idle', counter: counter + 1 };
              }
            }
          }
        });
        const mappingFunction = sinon.stub().returns({});
        const ConnectedComponent = connect(Comp).with('C').map(mappingFunction);

        mount(<ConnectedComponent message={ 'Hello' } />)

        machine.run();
        machine.run();
        machine.run();
        machine.run();
        machine.run();
        machine.run();

        expect(mappingFunction)
          .to.be.calledWith(sinon.match({
            state: { counter: 6, name: 'idle' }
          }))
        expect(render.callCount).to.be.equal(7);
      });
    });
  });
  describe('when unmounting the component', function () {
    it('should detach from the machines', function () {
      wrapper = getWrapper();
      Machine.get('A').run();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      Machine.get('A').stop();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      wrapper.unmount();
      Machine.get('A').run();
      expect(mapping.callCount).to.be.equal(3);
    });
  });
  describe('when we connect without mapping', function () {
    it('should detach from the machines', function () {
      class Component extends React.Component {
        constructor(props) {
          super(props);

          this.counter = 0;
        }
        render() {
          this.counter += 1;
          return <p>Rendered { this.counter } times</p>;
        }
      }
      const Connected = connect(Component).with('A', 'B').map();
      const connectedWrapper = mount(<Connected />);
      Machine.get('A').run();
      Machine.get('A').stop();
      // 1 - initial render
      // 2 - default mapping call
      // 3 - because of machine's action run
      // 4 - because of machine's action stop 
      expect(connectedWrapper.find('p').text()).to.equal('Rendered 4 times');
    });
  });
  describe('when we use mapSilent', function () {
    it('should only call the mapping function when the machine changes its state', function () {
      class Component extends React.Component {
        constructor(props) {
          super(props);
          
          this.counter = 0;
        }
        render() {
          this.counter += 1;
          return (
            <div>
              <p id='A'>{ this.props.message('machine A', this.props.stateA)}</p>
              <p id='counter'>Rendered { this.counter } times</p>
            </div>
          );
        }
      }
      const message = (machineName, state) => `${ machineName } is in a ${ state } state`;
      const Connected = connect(Component).with('A', 'B').mapSilent(A => {
        return {
          stateA: A.state.name
        }
      });
      const connectedWrapper = mount(<Connected message={ message }/>);
      expect(connectedWrapper.find('p#A').text()).to.equal('machine A is in a undefined state');
      Machine.get('A').run();
      expect(connectedWrapper.find('p#A').text()).to.equal('machine A is in a running state');
      // 1 - initial render
      // 2 - because of machine's action run
      expect(connectedWrapper.find('p#counter').text()).to.equal('Rendered 2 times');
    });
  });
  describe('and we have a middleware attached', function () {
    it('should call the proper hooks', function () {
      const onMachineConnected = sinon.spy();
      const onMachineDisconnected = sinon.spy();

      Machine.addMiddleware({ onMachineConnected, onMachineDisconnected });
      
      const machine = Machine.create('foo', { state: {}, transitions: {} });
      const Zoo = () => <p>Hello world</p>;
      const Connected = connect(Zoo).with('foo').map(() => ({}));
      const connectedWrapper = mount(<Connected />);

      expect(onMachineConnected).to.be.calledOnce.and.to.be.calledWith(
        sinon.match.array,
        sinon.match({ component: 'Zoo' })
      );
      expect(onMachineDisconnected).to.not.be.called;
      connectedWrapper.unmount();
      expect(onMachineDisconnected).to.be.calledOnce.and.to.be.calledWith(
        sinon.match.array,
        sinon.match({ component: 'Zoo' })
      );
    });
    describe('and we destroy a machine', function () {
      it('should call the proper hooks', function () {
        const onMachineConnected = sinon.spy();
        const onMachineDisconnected = sinon.spy();
  
        Machine.addMiddleware({ onMachineConnected, onMachineDisconnected });
        
        const machine = Machine.create('foo', { state: {}, transitions: {} });
        const Component = () => <p>Hello world</p>;
        const Connected = connect(Component).with('foo').map(() => ({}));
        const connectedWrapper = mount(<Connected />);
  
        expect(onMachineConnected).to.be.calledOnce;
        expect(onMachineDisconnected).to.not.be.called;
        machine.destroy();
        expect(onMachineDisconnected).to.be.calledOnce;
      });
    });
  });

  describe('and the problem described in issue #13', function () {
    it('should map the transition handler properly', function () {
      const spy = sinon.spy();
      class Issue13 extends React.Component {
        componentDidMount() {
          this.props.startProcess();
        }
        render() {
          return <p>Hello world</p>;
        }
      }

      const ConnectedIssue13 = connect(Issue13).with('issue13')
        .map(({ startProcess }) => ({ startProcess }));

      Machine.create('issue13', {
        state: { name: 'init' },
        transitions: {
          init: { startProcess: spy, 'ab': () => {} }
        }
      });

      mount(<ConnectedIssue13 />);

    });
  });
});