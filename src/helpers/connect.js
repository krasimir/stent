import { Machine } from '../';

var idIndex = 0;
var mappings = null;

const getId = () => ('m' + (++idIndex));
const setup = () => {
  if (mappings !== null) return;
  mappings = {};
  Machine.addMiddleware({
    onStateChange(next) {
      next();
      for (var id in mappings) {
        mappings[id].done(...mappings[id].machines);
      }
    }
  });
}

export function flush() {
  mappings = null;
}

export default function connect() {
  setup();
  const withFunc = (...names) => {
    const machines = names.map(name => Machine.get(name));
    const mapFunc = (done, once, silent) => {
      const id = getId();

      !once && (mappings[id] = { done, machines });
      !silent && done(...machines);

      return () => {
        if (mappings && mappings[id]) delete mappings[id];
      }
    }

    return {
      'map': mapFunc,
      'mapOnce': done => mapFunc(done, true),
      'mapSilent': done => mapFunc(done, false, true)
    }
  }

  return { 'with': withFunc };
}