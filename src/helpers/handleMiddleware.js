import { Machine } from '../';

export default function handleMiddleware(done, hook, machine, ...args) {
  const middlewares = Machine.middlewares;
  
  if (middlewares.length === 0) return done();

  const loop = (index, process) => index < middlewares.length - 1 ? process(index + 1) : done();

  (function process(index) {
    const middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, [ () => loop(index, process), ...args ]);
    } else {
      loop(index, process);
    }
  })(0);
}