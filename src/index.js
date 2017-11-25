import createMachine from './createMachine';
import {
  ERROR_MISSING_MACHINE,
  DEVTOOLS_KEY,
  MIDDLEWARE_MACHINE_CREATED
} from './constants';
import connect from './helpers/connect';
import { flush as flushConnectSetup } from './helpers/connect';
import handleMiddleware from './helpers/handleMiddleware';

class MachineFactory {
  constructor() {
    this.machines = {};
    this.middlewares = [];
    this.connect = connect;
  }
  create(name, config) {
    const machine = createMachine(name, config, this.middlewares);

    this.machines[machine.name] = machine;
    handleMiddleware(MIDDLEWARE_MACHINE_CREATED, machine, machine);
    return machine;
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