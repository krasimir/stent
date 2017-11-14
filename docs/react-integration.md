# Integrating with React 

[Full documentation](./README.md)

---

Stent provides a `connect` helper that creates a [HoC](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components). It gets re-rendered every time when the machine updates its state:

```js
import React from 'react';
import { connect } from 'stent/lib/react';

class TodoList extends React.Component {
  render() {
    const { isIdle, todos } = this.props;
    ...
  }
}

// `MachineA` and `MachineB` are machines defined
// using `Machine.create` function
export default connect(TodoList)
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    isIdle: MachineA.isIdle,
    todos: MachineB.state.todos
  });
```

The result of the mapping function goes as props to our component. Similarly to [Redux's connect `mapStateToProps`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) function. And of course the mapping function is `disconnect`ed when the component is unmounted.

Sometimes we want just the state changes subscription. In such cases we may skip the mapping function:

```js
const ConnectedComponent = connect(TodoList).with('MachineA', 'MachineB').map();
```

*`mapOnce` and `mapSilent` are also available for this React's helper.*

---

[Full documentation](./README.md)