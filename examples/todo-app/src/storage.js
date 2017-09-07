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
    return Promise.resolve(JSON.stringify(todos));
  }
}