import { Machine } from '../';
import handleMiddleware from './handleMiddleware';
import { MIDDLEWARE_MACHINE_CONNECTED, MIDDLEWARE_MACHINE_DISCONNECTED } from '../constants';

var idIndex = 0;
var mappings = null;

const getId = () => ('m' + (++idIndex));
const setup = () => {
  if (mappings !== null) return;
  mappings = {};
  Machine.addMiddleware({
    onStateChanged() {
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

export function getMapping() {
  return mappings;
}

export function destroy(machineId) {
  for(var mId in mappings) {
    mappings[mId].machines = mappings[mId].machines.filter(({ name }) => name !== machineId);
    handleMiddleware(MIDDLEWARE_MACHINE_DISCONNECTED, null, mappings[mId].machines);
    if (mappings[mId].machines.length === 0) {
      delete mappings[mId];
    }
  }
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
        handleMiddleware(MIDDLEWARE_MACHINE_DISCONNECTED, null, machines);
        if (mappings && mappings[id]) delete mappings[id];
      }
    }

    handleMiddleware(MIDDLEWARE_MACHINE_CONNECTED, null, machines);
    return {
      'map': mapFunc,
      'mapOnce': done => mapFunc(done, true),
      'mapSilent': done => mapFunc(done, false, true)
    }
  }

  return { 'with': withFunc };
}