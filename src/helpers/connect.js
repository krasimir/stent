import { Machine } from '../';

var idIndex = 0;
const getId = () => ('m' + (++idIndex));

export default function connect() {
  const mappings = {};

  Machine.addMiddleware({
    onStateChange(next) {
      next();
      for (var id in mappings) {
        mappings[id].done(...mappings[id].machines);
      }
    }
  });
  const withFunc = (...names) => {
    const machines = names.map(name => Machine.get(name));
    const mapFunc = (done, once) => {
      const id = getId();

      !once && (mappings[id] = { done, machines });
      done(...machines);

      return () => {
        if (mappings && mappings[id]) delete mappings[id];
      }
    }

    return {
      'map': mapFunc,
      'mapOnce': done => mapFunc(done, true)
    }
  }

  return { 'with': withFunc };
}