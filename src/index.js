import createMachine from './createMachine';
import {
  ERROR_MISSING_MACHINE,
  DEVTOOLS_KEY,
  MIDDLEWARE_MACHINE_CREATED,
  MIDDLEWARE_REGISTERED
} from './constants';
import connect from './helpers/connect';
import { flush as flushConnectSetup } from './helpers/connect';
import { destroy as cleanupConnections } from './helpers/connect';
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
    machine.destroy = () => this.destroy(machine);
    return machine;
  }
  get(name) {
    if (typeof name === 'object') name = name.name;
    if (this.machines[name]) return this.machines[name];
    throw new Error(ERROR_MISSING_MACHINE(name));
  }
  flush() {
    this.machines = {};
    this.middlewares = [];
    flushConnectSetup();
  }
  addMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      this.middlewares = this.middlewares.concat(middleware);
    } else {
      this.middlewares.push(middleware);
    }
    if (middleware[MIDDLEWARE_REGISTERED]) middleware[MIDDLEWARE_REGISTERED]();
  }
  destroy(machine) {
    var m = machine;
    if (typeof machine === 'string') {
      m = this.machines[machine];
      if (!m) throw new Error(ERROR_MISSING_MACHINE(machine));
    }
    delete this.machines[m.name];
    cleanupConnections(m.name);
  }
}

const factory = new MachineFactory();

export { factory as Machine };

if (typeof window !== 'undefined') {
  window[DEVTOOLS_KEY] = factory;
}