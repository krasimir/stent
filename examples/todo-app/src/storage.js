const TODOS = 'TODOS';

export default {
  load() {
    const todos = localStorage.getItem(TODOS) || '[]';

    return new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(todos));
      } catch(error) {
        reject(error);
      }
    });
  },
  save(todos) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(TODOS, JSON.stringify(todos));
        resolve();
      } catch(error) {
        reject(error);
      }
    });
  }
}