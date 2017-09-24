![Stent - brings the power of state machines to the web](./_logo/logo.jpg)

Stent is combining the ideas of [Redux](http://redux.js.org/) with the concept of [state machines](https://en.wikipedia.org/wiki/Automata_theory).

![Travis](https://travis-ci.org/krasimir/stent.svg?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/stent.svg?style=flat-square)](https://www.npmjs.com/package/stent)

---
* [A few words about state machines](#a-few-words-about-state-machines)
* [Installation](#installation)
* [Getting started](##getting-started)
* [API](#api)
  * [`<state object>`](#state-object)
  * [`Machine.create` and `Machine.get`](#machinecreate-and-machineget)
  * [`<action-handler>`](#action-handler)
  * [`connect` and `disconnect`](#connect-and-disconnect)
  * [Middlewares](#middlewares)
  * [React integration](#react-integration)
* [Examples](#examples)
* [Misc](#misc)
---

## A few words about state machines

State machine is a mathematical model of computation. It's an abstract concept where the machine may have different states but at a given time fulfills only one of them. It accepts input and based on that (plus its current state) transitions to another state. Isn't it familiar? Yes, it sounds like a front-end application. That's why this model/concept applies nicely to UI development.

*Disclaimer: there are different types of state machines. I think the one that makes sense for front-end development is [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine).*

## Installation

The library is available as a [npm module](https://www.npmjs.com/package/stent) so `npm install stent` or `yarn add stent` will do the job. There's also a standalone version [here](./standalone) (only core functionalities) which you can directly add to your page.

## Getting started

To create a new machine we simply import the `Machine` object and call its `create` method.

```js
import { Machine } from 'stent';

const machine = Machine.create('name-of-the-machine', {
  state: { name: 'idle' },
  transitions: {
    'idle': {
      'run': 'running'
    },
    'running': {
      'stop': 'idle'
    }
  }
});
```

`{ name: 'idle'}` is the initial state. `transitions` is the place where we define all the possible states of the machine (`idle` and `running`) with the their inputs (actions `run` and `stop`) that they accept. Notice that `stop` is not available when we are at `idle` state and `run` when we are at `running` state. That is an essential characteristic of the state machines - our app is doing only what we allow it to do. There is no sense to call `run` if we are already `running`. The state machine is eliminating side effects that lead to bugs from the very beginning. The library enforces declarative approach of programming which means that by defining the possible states and actions we clearly say what's possible in our application. The user and data flows become a lot more predictable simply because we restrict ourselves of dispatching actions at the wrong time/state.

And because after the definition the machine knows what to expect it automatically creates a couple of things for us so. Based on the `transitions` property Stent generates:

* Helper methods for checking if the machine is in a particular state. `idle` state produces `isIdle()` method, for `running` we have `isRunning()`.
* Helper methods for dispatching actions - `run()` and `stop()`.

*We may use spaces and/or dashes in the state or action names but the rule is that Stent transforms the string to a camel case. For example if we have `fetching data` state the machine will have `isFetchingData()` method, `get fresh todos` action will result in `getFetchTodos()` method.*

So, here's an example of how to use the machine above:

```js
if (machine.isIdle()) {
  machine.run();
}
if (machine.isRunning()) {
  machine.stop();
}
console.log(machine.isIdle()); // true
```

The created machine may accept more then a string as a handler of the action. We may pass a function which accepts two arguments. The first one is the current state and the second one is some meta data traveling with the action (if any). For example:

```js
const machine = Machine.create('todo-app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'add todo': function (state, todo) {
        return {
          name: 'idle',
          todos: [...state.todos, todo]
        };
      }
    }
  }
});

machine.addTodo({ title: 'Fix that damn bug' })
```

The *state* in the context of Stent is a vanilla JavaScript object literal. The only one reserved property is `name` which represents the state's name. Everything else depends on our business logic. In the example above that's the `todos` array.

The handler function accepts the previous state and should return a new state in a immutable fashion. Same as the [Redux's reducer](http://redux.js.org/docs/basics/Reducers.html), whatever we return becomes the new state.

The actual todo item is passed to the `addTodo` method and it comes as a second argument of the handler.

Stent also accepts a generator function as a handler. That's inspired by the [redux-saga](https://redux-saga.js.org/) project. The generators have couple of interesting characteristics and this library uses two of them - the ability to generate multiple results (from a single function) and the ability to *pause* the execution. What if we need to fetch data from the server and want to handle that process with multiple states - `idle`, `fetching`, `done` and `error`. Here's how to do it with a generator as a handler:

```js
const machine = Machine.create('todo-app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'fetch todos': function * () {
        yield { name: 'fetching' };

        try {
          const todos = yield call(getTodos, '/api/todos');
        } catch (error) {
          return { name: 'error', error };
        }

        return { name: 'done', todos };
      }
    }
  }
});
```

Assuming that `getTodos` is a function that accepts an endpoint as a string and returns a promise. Inside the generator we are allowed to `yield` two type of things:

* A state object (which transitions the machine to that new state)
* A call of Stent's helper functions like `call`. (more about those [helpers](#action-handler) below)

Generator as an action handler is suitable for the cases where we do more then one thing and/or have async operations.

## API

### `<state object>`

The state object is just a normal object literal. The only one required property is `name` and it is used to indicate the state of the machine:

```js
{
  name: 'idle',
  user: {
    firstName: '...',
    lastName: '...'
  },
  someOtherProperty: '...'
}
```

If you try transitioning to a state which is not defined into the `transitions` section or it has no actions in it Stent will throw an exception. It's because once you get into that new state you are basically stuck.

### `Machine.<create|get|flush>`

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

`Machine.flush()` can be used to delete the currently created machines and [middlewares](#middlewares).

### `<action handler>`

The action handler may be just a string. In the following example `fetching` is the same as `{ name: 'fetching' }` state object.

```js
Machine.create('app', {
  'idle': {
    'fetch data': 'fetching'
  }
});
```

Could be also a state object:

```js
Machine.create('app', {
  'idle': {
    'fetch data': { name: 'fetching', data: [], pending: false }
  }
});
```

Another variant is to use a function that returns a string. Which again results in `{ name: 'fetching' }`.

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      return 'fetching';
    }
  }
});
```

Notice that the function receives the current state and some payload passed when the action is fired.

And of course we may return the actual state object. That's actually a common case because very often we want to keep some data alongside: 

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      return { name: 'fetching', answer: 42 };
    }
  }
});
```

The context of the action handler function (or generator) is the machine itself. This means that `this` inside the function points to the created machine and we may call its methods. For example:

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      if (this.isIdle()) {
        this.request('/api/todos');
      }
    },
    'request': function (state, endpoint) {
      console.log(endpoint); // endpoint = /api/todos
    }
  }
});
```

In some cases you don't want to change the state but only handle the action. So feel free to skip the `return` statement. If the handler returns `undefined` the machine keeps its state.

We may also use a generator if we have more complex operations or/and async tasks.

```js
Machine.create('app', {
  'idle': {
    'fetch data': function * (state, payload) {
      yield 'fetching'; // transition to a `fetching` state
      yield { name: 'fetching' } // the same but using a state object
    }
  }
});
```

What we can `yield` is state object (or a string that represents a state) or a call to some of the predefined Stent helpers `call` and `wait`.

#### `yield call(<function>, ...args)`

`call` is blocking the generator function and calls `<function>` with the given `...args`. `<function>` could be:

* A synchronous function that returns result
* A function that returns a promise
* Another generator function

```js
import { call } from 'stent/lib/helpers';

Machine.create('app', {
  'idle': {
    'fetch data': function * () {
      const data = yield call(requestToBackend, '/api/todos/', 'POST');
    }
  }
});
```

*`requestToBackend` is getting called with `/api/todos/` and `POST` as arguments.*

#### `yield wait(<action name/s>)`

It's blocking the generator and waits for action/s. The function accepts one or many arguments as strings, or array of strings.

```js
import { wait } from 'stent/lib/helpers';

Machine.create('app', {
  'idle': {
    'fetch data': function * () {
      const initActionPayload = yield wait('init');
      const [ data, isError ] = yield wait('get the data', 'check for errors');
      const [ userProfilePayload, dataPayload ] = yield wait([
        'user profile fetched',
        'data processed'
      ]);
      ...
    }
  }
});
```

### `connect` and `disconnect`

`connect` is the short way to do `Machine.get` and retrieving one or more created machines. It also provides a mechanism for subscribing for machine's state changes.

```js
import { connect } from 'stent/lib/helpers';

Machine.create('MachineA', ...);
Machine.create('MachineB', ...);

connect()
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    // called once by default and then
    // multiple times when the state of
    // MachineA or MachineB changes
  });
```

The mapping function by default is called once initially and then every time when the state of the connected machines changes. So, if you need only that first call use `mapOnce` instead.

```js
connect()
  .with('MachineA', 'MachineB')
  .mapOnce((MachineA, MachineB) => {
    // this gets called only once
  });
```

If you want to use `map` but skip the initial call of your mapping function then use `mapSilent`:

```js
connect()
  .with('MachineA', 'MachineB')
  .mapSilent((MachineA, MachineB) => {
    // called multiple times when the state of
    // MachineA or MachineB changes
  });
```

You may also need to `disconnect` which makes sense if you use the `map` function. If you are connecting with `mapOnce` your mapping function is getting called only once anyway.

```js
const disconnect = connect()
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    // called multiple times
  });

// at some point later
disconnect();
```

### Middlewares

If you want to extend the library with some additional functionalities you may add a middleware. In fact Stent uses middleware internally for implementing the `connect` helper. We have to call `addMiddleware with a single parameter which is an object with a set of functions that hook to the lifecycle methods of Stent.

```js
import { Machine } from 'stent';

Machine.addMiddleware({
  onActionDispatched(next, actionName, ...args) {
    console.log(`Action dispatched: ${ actionName }`);
    next();
    console.log(`After ${ actionName } action our state is ${ this.state.name }`);
  },
  onStateChanged(next) {
    console.log(`The new state will be: ${ this.state.name }`);
    next();
    console.log(`The state now is: ${ this.state.name }`);
  }
});
```

The hooks above are getting called just before running the internal Stent's logic. At this moment nothing in the machine is changing/executing. Calling `next` will pass the control flow to Stent. Also have in mind that these methods are fired with the machine as a context. Which means that we have an access to the current state and methods.

*If you have more then one middleware to add pass an array of objects instead of multiple calls of `addMiddleware`.*

There are some build in middlewares which are part of the Stent package.

**`Logger`**

It prints out some useful stuff in the dev tools console.

```js
import { Machine } from 'stent';
import { Logger } from 'stent/middlewares/Logger';

Machine.addMiddleware(Logger);
```

### React integration

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

## Examples

### ToDo applciation using [create-react-app](https://github.com/facebookincubator/create-react-app)

[Here.](./examples/todo-app)

### Small ToDo app

```js
import { Machine } from 'stent';

const machine = Machine.create('app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'add new todo': function ({ todos }, todo) {
        return { name: 'idle', todos: [...todos, todo] };
      },
      'delete todo': function ({ todos }, index) {
        return { name: 'idle', todos: todos.splice(index, 1) };
      },
      'fetch todos': function * () {
        yield 'fetching';

        try {
          const todos = yield call(getTodos, '/api/todos');
        } catch (error) {
          return { name: 'fetching failed', error };
        }

        return { name: 'idle', todos };
      }
    },
    'fetching failed': {
      'fetch todos': function * () {
        yield { name: 'idle', error: null };
        this.fetchTodos();
      }
    }
  }
});

machine.fetchTodos();
```

### Integration with React

```js
import React from 'react';
import { connect } from 'stent/lib/react';

class TodoList extends React.Component {
  render() {
    const { todos, error, isFetching, fetchTodos, deleteTodo, isAuthorized } = this.props;

    if (isFetching()) return <p>Loading</p>;
    if (error) return (
      <div>
        Error fetching todos: { error }<br />
        <button onClick={ fetchTodos }>try again</button>
      </div>
    );

    return (
      <ul>
      { todos.map(({ text}) => <li onClick={ deleteTodo }>{ text }</li>) }
      </ul>
    );
  }
}

// `todos` and `authorization` are machines defined
// using `Machine.create` function
export default connect(TodoList)
  .with('todos', 'authorization')
  .map(({ state, isFetching, fetchTodos, deleteTodo }, { isAuthorized }) => {
    todos: state.todos,
    error: state.error,
    isFetching,
    fetchTodos,
    deleteTodo,
    isAuthorized
  });
```

## Misc

* [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine)
