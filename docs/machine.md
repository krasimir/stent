# `Machine.<api method>`

[Full documentation](./README.md)

---

The `Machine` object is used for creating/managing and fetching machines.

```js
import { Machine } from 'stent';

const appMachine = Machine.create(
  'app', // name of the machine
  {
    state: <state object>, // initial state
    transitions: {
      <state name>: {
        <action name>: <action handler>,
        <action name>: <action handler>,
        ...
      },
      <state name>: {
        <action name>: <action handler>,
        <action name>: <action handler>,
        ...
      },
      ...
    }
  }
);

// later in the code
const appMachine = Machine.get('app');
```

If you don't plan to reference the machine by name with `Machine.get` or with the `connect` helper then you may skip the first argument. In the example above if we skip `'app'` Stent will still create the machine but with a dynamically generated name. You may even reduce the noise and pass the state as a first argument and the transitions as second:

```js
const appMachine = Machine.create(
  // initial state
  <state object>,
  // transitions
  {
    <state name>: {
      <action name>: <action handler>,
      <action name>: <action handler>,
      ...
    },
    <state name>: {
      <action name>: <action handler>,
      <action name>: <action handler>,
      ...
    },
    ...
  }
);
```

The created machine has dynamically created methods associated with the provided configuration:

* For every state there is a `is<state name>` method so we can check if the machine is in that state. For example, to check if the machine is in a `fetching remote data` state we may call `machine.isFetchingRemoteData()` method. The alternative is `machine.state.name === 'fetching remote data'`.
* For every action there is a method to fire it. Whatever we pass goes to the handler. For example, `add new todo` is available as `machine.addNewTodo(<todo data here>)`.

`Machine.flush()` can be used to delete the currently created machines and [middlewares](./middlewares.md).

---

[Full documentation](./README.md)