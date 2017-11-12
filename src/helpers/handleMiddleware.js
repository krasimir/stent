import { Machine } from '../';

export default function handleMiddleware(hook, machine, ...args) {
  const middlewares = Machine.middlewares;
  
  if (middlewares.length === 0) {
    return;
  }

  const loop = (index, process) => index < middlewares.length - 1 ? process(index + 1) : null;

  (function process(index) {
    const middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, args);
    }
    loop(index, process);
  })(0);
}