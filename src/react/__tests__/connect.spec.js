import React from 'react';
import { Machine } from '../../';
import connect from '../connect';
import { mount } from 'enzyme';

var wrapper;
const mapping = sinon.spy();

function getWrapper(once) {
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

  const ConnectedComponent = connect(Component)
    .with('A', 'B')
    [once ? 'mapOnce' : 'map']((A, B) => {
      mapping(A, B);
      return {
        stateA: A.state.name,
        stateB: B.state.name,
        run: A.run,
        fetch: B.fetch
      }
    });
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
    wrapper = getWrapper();
  });
  describe('when connecting a component', function () {
    it('should call our mapping function', function () {
      expect(mapping).to.be.calledOnce;
    });
    it('should map machines state and actions properly', function () {
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      expect(wrapper.find('p#B').text()).to.equal('machine B is in a waiting state');
    });
    it('should get re-rendered if a machine\'s state is changed', function () {
      const runButton = wrapper.find('button#run');
      const fetchButton = wrapper.find('button#fetch');

      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      runButton.simulate('click');
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      expect(runButton.simulate.bind(runButton, 'click')).to.throw('"run" action is not available in "running" state');

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
  });
  describe('when unmounting the component', function () {
    it('should detach from the machines', function () {
      Machine.get('A').run();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a running state');
      Machine.get('A').stop();
      expect(wrapper.find('p#A').text()).to.equal('machine A is in a idle state');
      wrapper.unmount();
      Machine.get('A').run();
      expect(mapping.callCount).to.be.equal(3);
    });
  });
});