import createMachine from './createMachine';
import { ERROR_MISSING_MACHINE, DEVTOOLS_KEY } from './constants';
import connect from './helpers/connect';
import { flush as flushConnectSetup } from './helpers/connect';

class MachineFactory {
  constructor() {
    this.machines = {};
    this.middlewares = [];
    this.connect = connect;
  }
  create(name, config) {
    const machine = createMachine(name, config, this.middlewares);

    return this.machines[machine.name] = machine;
  }
  get(name) {
    if (typeof name === 'object') name = name.name;
    if (this.machines[name]) return this.machines[name];
    throw new Error(ERROR_MISSING_MACHINE(name));
  }
  flush() {
    this.machines = [];
    this.middlewares = [];
    flushConnectSetup();
  }
  addMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      this.middlewares = this.middlewares.concat(middleware);
    } else {
      this.middlewares.push(middleware);
    }
  }
}

const factory = new MachineFactory();

export { factory as Machine };

if (typeof window !== 'undefined') {
  window[DEVTOOLS_KEY] = factory;
}