import React from 'react';
import { mount } from 'enzyme';

function doSomething(data) {
  const { name } = data;

  return (<p><small>{ `Hello ${ name }` }</small></p>);
}

describe('Given the Stent library', function () {
  describe('when running something', function () {
    it('should do something', function () {
      const Component = doSomething({ name: 'world' });
      const wrapper = mount(Component);

      expect(wrapper.text()).to.equal('Hello world');
    });
  });
});