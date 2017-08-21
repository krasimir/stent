# Mealy

Container for mealy state machines

## API

## Example: Working with a state machine

```js
import { actions, Machine } from 'mealy';

const todos = Machine.create('app', { name: 'stand by', todos: [] });

todos.transitions({
  'stand by': {
    'add new todo': function ({ todos }, todo) {
      todos.push(todo);
      return { todos };
    },
    'delete todo': function ({ data }, index) {
      return { data: state.data.splice(index, 1) };
    },
    'fetch todos': function * () {
      yield { name: 'fetching' };

      try {
        const todos = await getTodos('/api/todos');
      } catch (error) {
        return { name: 'fetching failed', todos: [], error };
      }

      return { name: 'stand by', todos };
    }
  },
  'fetching failed': {
    'fetch todos': function * () {
      yield { name: 'stand by' };
      fetchTodos();
    }
  }
});

const { fetchTodos } = actions();

fetchTodos();
```

## Example: React integration

```js
import React from 'react';
import { connect } from 'mealy/react';
import { actions } from 'mealy';

const { fetchTodos, deleteTodo } = actions();

class TodoList extends React.Component {
  render() {
    const { state, todos, error } = this.props;

    if (state === 'fetching') return <p>Loading</p>;
    if (state === 'fetching-failed') return (
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
  .map(({ name, todos }) => { state: name, todos });
```

## Misc

* [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine)
