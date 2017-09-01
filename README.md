# Stent

Container for Mealy finite state machines

## Getting started

The library is available as a [npm module stent](https://www.npmjs.com/package/stent). There's a standalone version [here](./lib/stent.js).

To create a new machine:

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

The machine above has two possible states `idle` and `running`. When we are at the `idle` state (the default one) there is only one acceptable action `run`. It *transition*s the machine to a `running` state. The `running` state does not accept `run` but only `stop` action. If fired we are going back to an `idle` state.

`Stent` library is enforcing declarative approach. Because it knows the possible states and actions it automatically creates a couple of things for you. Based on the `transitions` property we have:

* Helper methods for checking if the machine is in a particular state. `idle` state leads to `isIdle()` method, for `running` we have `isRunning()`. Have in mind that you may use spaces or dashes in the state's name but the rule of thumb is that Stent transforms the string to a camel case. For example if you have `fetching data` the machine will have `isFetchingData()` method.
* Helper methods for dispatching actions. Same as above Stent generates methods based on your transitions declarations. For the machine in the example above we'll have `run()` and `stop()`. Again the camel case transformation is applied. So an action `get todos from the api` is translated to `getTodosFromTheApi()`.

So here's a simple usage of the same example:

```js
if (machine.isIdle()) {
  machine.run();
}
if (machine.isRunning()) {
  machine.stop();
}
console.log(machine.isIdle()); // true
```

Of course this doesn't make a lot of sense but we see what are the available methods.

The created machine accepts more then a string as a handler of the action. We may pass a function which accepts two arguments. The first one is the state object and the second one is some meta data traveling with the action. For example:

```js
const machine = Machine.create('todo-app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'add todo': function * (state, todo) {
        return {
          todos: [...state.todos, todo]
        };
      }
    }
  }
});

machine.addTodo({ title: 'Fix that damn bug' })
```

There are a couple of points that we have to make - the *state object* in the context of Stent is a vanilla JavaScript object literal. The only one reserved property is `name` which represents the state's name. We may add whatever we want afterwards. In this example is the `todos` array.
The handler function accepts the previous state and should return the new state in a immutable fashion. Same as the [Redux's reducer](http://redux.js.org/docs/basics/Reducers.html), whatever we return becomes the new state. Notice that if we are changing only the data we may skip the `name` property (it is missing in the `return` statement). Adding a new todo is a synchronous operation for us so we don't need an additional state. The actual todo item is passed to the `addTodo` method of the machine and comes as a second argument of the handler.

Stent also accepts a generator function as a handler. That's inspired by the [redux-saga](https://redux-saga.js.org/) project. The generators have couple of interesting characteristics and this library uses two of them - the ability to generate multiple results and the ability to *pause* the execution.
What if we need to fetch data from the server and want to handle that process with multiple states - `idle`, `fetching`, `done` and `error`. Here's how to do it with a generator as a handler:

```js
const machine = Machine.create('todo-app', {
  state: { name: 'idle', todos: [] },
  transitions: {
    'idle': {
      'fetch todos': function () {
        yield { name: 'fetching' };


      }
    }
  }
});
```

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
        return { todos };
      },
      'delete todo': function ({ todos }, index) {
        return { todos: todos.splice(index, 1) };
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
