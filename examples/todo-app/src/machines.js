import { Machine } from 'stent';
import storage from './storage';
import { call } from 'stent/lib/helpers';

Machine.create('todos', {
  state: { name: 'idle', todos: [] },
  transitions: {
    idle: {
      'fetch todos': function * () {
        yield 'fetching';

        try {
          this.todosLoaded(yield call(storage.load));
        } catch (error) {
          this.error('Can not load the ToDos. Reason: ' + error);
        }
      }
    },
    fetching: {
      'todos loaded': function (state, todos) {
        return { name: 'idle', todos };
      },
      'error': function (state, error) {
        return { name: 'error', error }
      }
    },
    error: {
      'fetch todos': function * () {
        yield 'idle';
        this.fetchTodos();
      }
    }
  }
});