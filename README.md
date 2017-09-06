# Stent

Stent is combining the ideas of redux with the concept of state machines.

---
* [A few words about state machines](#a-few-words-about-state-machines)
* [Installation](#installation)
* [Getting started](##getting-started)
* [API](#api)
  * [`<state object>`](#state-object)
  * [`Machine.create` and `Machine.get`](#machinecreate-and-machineget)
  * [`<action-handler>`](#action-handler)
  * [`connect` and `disconnect`](#connect-and-disconnect)
  * [Helpers used inside generators](#helpers-used-inside-generators)
  * [Middlewares](#middlewares)
* [Examples](#examples)
* [Misc](#misc)
---

## A few words about state machines

State machine is a mathematical model of computation. It's an abstract concept where the machine may have different states but at a given time fulfills only one of them. It accepts input and based on that (plus its current state) transitions to another state. Isn't it sounds familiar? Yes, it sounds like a front-end application. That's why this model/concept applies nicely to UI development.

*Disclaimer: there are different types of state machines. I think the one that makes sense for front-end development is [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine).*

## Installation

The library is available as a [npm module](https://www.npmjs.com/package/stent) so `npm install stent` or `yarn add stent` will do the job. There's also a standalone version [here](./standalone/stent.js) (only core functionalities) which you can directly add to your page.

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

The machine above has two possible states `idle` and `running`. When we are at the `idle` state (the default one) there is only one acceptable action/input `run`. It *transition*s the machine to a `running` state. The `running` state does not accept `run` but only `stop` action. If fired we are going back to the `idle` state.

Stent library is enforcing declarative approach of programming. Which means that by defining the possible states and actions in one place we clearly script what happens in our app without actually doing it. After that the machine knows what to expect and automatically creates a couple of things for us so we can trigger the logic. Based on the `transitions` property we have:

* Helper methods for checking if the machine is in a particular state. `idle` state produces `isIdle()` method, for `running` we have `isRunning()`.
* Helper methods for dispatching actions - `run()` and `stop()`.

*We may use spaces or dashes in the state or action names but the rule of thumb is that Stent transforms the string to a camel case. For example if we have `fetching data` state the machine will have `isFetchingData()` method, `get fresh todos` action will result into `getFetchTodos()` method.*

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

*Of course, this doesn't make a lot of sense but we see the available methods.*

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

The actual todo item is passed to the `addTodo` method of the machine and comes as a second argument of the handler.

Stent also accepts a generator function as a handler. That's inspired by the [redux-saga](https://redux-saga.js.org/) project. The generators have couple of interesting characteristics and this library uses two of them - the ability to generate multiple results from a single function and the ability to *pause* the execution.

What if we need to fetch data from the server and want to handle that process with multiple states - `idle`, `fetching`, `done` or `error`. Here's how to do it with a generator as a handler:

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

Assuming that `getTodos` is a function that accepts an endpoint and returns a promise. Inside the generator we are allowed to `yield` two type of things:

* A state object (which transitions the machine to that new state)
* A call of Stent's helper functions like `call`. (more about those helpers below)

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

### `Machine.<create|get|flush|connect>`

The `Machine` object is used for creating and fetching machines.

```js
import { Machine } from 'stent';

const appMachine = Machine.create(
  'app', // name of the machine
  {
    state: <state object>,
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

The created machine has dynamically created methods associated with the provided configuration:

* For every state there is a `is<state name>` method so we can check if the machine is in that state. For example, to check if the machine is in a `fetching remote data` state we may call `machine.isFetchingRemoteData()` method. The laternative is `machine.state.name === 'fetching remote data'`.
* For every action there is a method to fire it. Whatever we pass goes to the handler. For example, `add new todos` is available as `machine.addNewTodo(<todo data here>)`.

`Machine.flush()` can be used to delete the currently created machines.

`Machine.connect()` is the same as the [connect](#connect-and-disconnect) helper.

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

Notice that the function receives the current state and some payload passed when the action is called.

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
    'request': function (endpoint) {
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

*More for generators and what could be yielded in the [Helpers used inside generators](#helpers-used-inside-generators) section below.*

### `connect` and `disconnect`

`connect` is the short way to do `Machine.get` and retrieving one or more created machines.

```js
import { connect } from 'stent/helpers';

Machine.create('MachineA', ...);
Machine.create('MachineB', ...);

connect()
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    // called multiple times
  });
```

The mapping function by default is called once and then every time when the state of the connected machines changes. So, if you need only that first call use `mapOnce` instead.

```js
connect()
  .with('MachineA', 'MachineB')
  .mapOnce((MachineA, MachineB) => {
    // this gets called only once
  });
```

You may also need to `disconnect` which makes sense if you use the `map` function. If you are connecting with `mapOnce` your mapping function is getting called only once anyway.

```js
const disconnect = connect()
  .with('MachineA', 'MachineB')
  .mapOnce((MachineA, MachineB) => {
    // this gets called only once
  });

// at some point later
disconnect();
```

There's also a helper for integrating with React. It creates a [HOC](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components):

```js
import React from 'react';
import { connect } from 'stent/react';

class TodoList extends React.Component {
  render() {
    const { todos, error, isFetching, fetchTodos, deleteTodo } = this.props;
    ...
  }
}

// `todos` and `authorization` are machines defined
// using `Machine.create` function
export default connect(TodoList)
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    isIdle: MachineA.isIdle,
    todos: MachineB.state.todos
  });
```

The result of the `map` function goes as props to our component. Similarly to [Redux's connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) function. And of course the mapping function is disconnected when the component is unmounted.

### Helpers used inside generators

#### `yield call(<function>, ...args)`

It's blocking the generator function and calls `<function>` with the given `...args`. `<function>` could be:

* A synchronous function that returns result
* A function that returns a promise
* Another generator function

```js
import { call } from 'stent/helpers';

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

It's blocking the generator and waits for action/s. The function accepts a single argument string or array of strings.

```js
import { wait } from 'stent/helpers';

Machine.create('app', {
  'idle': {
    'fetch data': function * () {
      const initActionPayload = yield wait('init');
      const [ userProfilePayload, dataPayload ] = yield wait([
        'user profile fetched',
        'data processed'
      ]);
      ...
    }
  }
});
```

### Middlewares

If you want to extend the library with some additional functionalities you may add a middleware. It's an object with a set of functions that hook to the lifecycle methods of Stent.

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

The hooks above are getting called just before running the internal Stent's logic. At this moment nothing in the machine is changing/executing. Calling `next` will pass the control flow to Stent. Also have in mind that these methods are fired with the machine as a context. Which means that you have an access to the current state and methods.

## Examples

### Transitioning to another state

From `idle` to `fetching` by using `fetch data` action.

```js
// Just pass the new state as a handler for an action
Machine.create('app', {
  'idle': {
    'fetch data': 'fetching'
  }
});

// Return a string in the handler
Machine.create('app', {
  'idle': {
    'fetch data': function () {
      return 'fetching';
    }
  }
});

// Return a state object
Machine.create('app', {
  'idle': {
    'fetch data': function () {
      return { name: 'fetching' };
    }
  }
});

// Yield a string in the handler's generator
Machine.create('app', {
  'idle': {
    'fetch data': function * () {
      yield 'fetching';
      // or you can yield a state object
      // `yield { name: 'fetching' }`
    }
  }
});
```

### Having dependent actions

For the cases where you want to do something as a result of two (or more) actions. From `idle` state to `done` when `fetching in progress` and `success` (or `fail`) actions are dispatched.

```js
Machine.create('app', {
  'idle': {
    'fetching in progress': function * () {
      const [ data, error ] = yield wait(['success', 'fail']);
      // or just `const data = yield wait('success')`
      // if we are interested only in one action

      return data ? { name: 'done', data } : { name: 'done', error };
    }
  }
});
```

*This example is a bit silly. We'll probably go with a separate state when data fetching is in progress.*

### Small ToDo app

```js
import { Machine } from 'stent';

const machine = Machine.create('app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'add new todo': function ({ todos }, todo) {
        todos.push(todo);
        return { name: 'idle', todos };
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
import { connect } from 'stent/react';

class TodoList extends React.Component {
  render() {
    const { todos, error, isFetching, fetchTodos, deleteTodo } = this.props;

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
