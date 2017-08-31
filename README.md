# Mealy

Container for mealy state machines

## API

## Example: Working with a state machine

```js
import { Machine } from 'mealy';

const machine = Machine.create('app', {
  state: { name: 'standby', todos: [] },
  transitions: {
    'standby': {
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
          const todos = await getTodos('/api/todos');
        } catch (error) {
          return { name: 'fetching failed', error };
        }

        return { name: 'standby', todos };
      }
    },
    'fetching failed': {
      'fetch todos': function * () {
        yield { name: 'standby', error: null };
        this.fetchTodos();
      }
    }
  }
});

machine.fetchTodos();
```

## Example: React integration

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
