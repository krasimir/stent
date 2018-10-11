# Getting started

[Full documentation](./README.md)

---

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

`{ name: 'idle'}` is the initial state. `transitions` is the place where we define all the possible states of the machine (`idle` and `running`) with their inputs (actions `run` and `stop`) that they accept. Notice that `stop` is not available when we are at `idle` state and `run` when we are at `running` state. That is an essential characteristic of the state machines - our app is doing only what we allow it to do. There is no sense to call `run` if we are already `running`. The state machine is eliminating side effects that lead to bugs from the very beginning. The library enforces declarative approach of programming which means that by defining the possible states and actions we clearly say what's possible in our application. The user and data flows become a lot more predictable simply because we restrict ourselves of dispatching actions at the wrong time/state.

And because after the definition the machine knows what to expect it automatically creates a couple of things for us so. Based on the `transitions` property Stent generates:

* Helper methods for checking if the machine is in a particular state. `idle` state produces `isIdle()` method, for `running` we have `isRunning()`.
* Helper methods for dispatching actions - `run()` and `stop()`. If these methods are generators you may want to use also `run.latest()` or `stop.latest()` which still accepts the action but cancels the logic of a previous call. For example if we fire `run` multiple times really quick and we want to handle only the last one we should use `run.latest()` instead. Go to [action-handler](./action-handler.md) section to learn more.

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

The created machine may accept more than a string as a handler of the action. We may pass a function which accepts two arguments. The first one is the current state and the second one is some meta data traveling with the action (if any). For example:

```js
const machine = Machine.create('todo-app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'add todo': function (machine, todo) {
        return {
          name: 'idle',
          todos: [...machine.state.todos, todo]
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
* A call of Stent's helper functions like `call`. (more about those [helpers](./action-handler.md) below)

Generator as an action handler is suitable for the cases where we do more then one thing and/or have async operations.

---

[Full documentation](./README.md)
