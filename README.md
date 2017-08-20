# Mealy

Container for mealy state machines

## API

```js
import { state, createMachine } from 'mealy';

const todos = createMachine(state('standby', []));

todos
  .given('standby')
    .when('add-new-todo')
      .then(function ({ data }, todo) {
        data.push(todo);
        return state(null, data);
      })
    .when('delete-todo')
      .then(function ({ data }, index) {
        return state(null, data.splice(index, 1));
      })
    .when('fetch-todos')
      .then(function * () {
        yield state('fetching');

        try {
          const todos = yield call(getTodos, '/api/todos');
        } catch (error) {
          return state('fetching-failed', error);
        }

        return state('standby', todos);
      })
  .given('fetching-failed')
    .when('fetch-todos')
      .then(function * ({ dispatch }) {
        yield state('standby', []);
        yield dispatch('fetch-todos');
      });


todos.dispatch('fetch-todos');

```

## Misc

* [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine)
