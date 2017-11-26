import { call } from 'stent/lib/helpers';
import storage from '../storage';

function * saveTodos (todos) {
  try {
    yield call(storage.save, [ ...todos ]);
    return { name: 'idle', todos: [ ...todos ] };
  } catch(error) {
    throw new Error(error);
  } 
}

export default {
  state: { name: 'idle', todos: [] },
  transitions: {
    idle: {
      'fetch todos': function * () {
        console.log('a');
        yield 'fetching';
        console.log('b');
        try {
          this.todosLoaded(yield call(storage.load));
        } catch (error) {
          this.error('Can not load the ToDos. Reason: ' + error);
        }
      },
      'add new todo': function * ({ todos }, todo) {
        return yield call(saveTodos, [...todos, todo]);
      },
      'delete todo': function * ({ todos }, index) {
        todos.splice(index, 1);
        return yield call(saveTodos, todos);
      },
      'edit todo': function * ({ todos }, index, label) {
        todos[index].label = label;
        return yield call(saveTodos, todos);
      },
      'change status': function * ({ todos }, index, done) {
        todos[index].done = done;
        return yield call(saveTodos, todos);
      }
    },
    fetching: {
      'todos loaded': (state, todos) => ({ name: 'idle', todos }),
      'error': (state, error) => ({ name: 'error', error })
    },
    error: {
      'fetch todos': function * () {
        yield 'idle';
        this.fetchTodos();
      }
    }
  }
};