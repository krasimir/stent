# Stent

Container for mealy state machines

## API

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
import { Machine } from 'mealy';

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
import { connect } from 'mealy/react';

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

export default connect(TodoList)
  .with('app')
  .map(({ state, isFetching, fetchTodos, deleteTodo } => {
    todos: state.todos,
    error: state.error,
    isFetching,
    fetchTodos,
    deleteTodo
  }));
```

## Misc

* [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine)
