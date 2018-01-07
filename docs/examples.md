# Examples

[Full documentation](./README.md)

---

### Getting from Redux to stent

[click here](http://krasimirtsonev.com/blog/article/getting-from-redux-to-state-machine-with-stent)

### React ToDo applciation using [create-react-app](https://github.com/facebookincubator/create-react-app)

[Here.](../examples/todo-app)

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

---

[Full documentation](./README.md)
