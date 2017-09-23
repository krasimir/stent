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
        const { done, machines } = mappings[id];

        if (machines.map(m => m.name).indexOf(this.name) >= 0) {
          done && done(...machines);
        }
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
      !silent && done && done(...machines);

      return function disconnect() {
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