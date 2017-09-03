import createMachine from './createMachine';
import { ERROR_MISSING_MACHINE } from './constants';

class MachineFactory {
  constructor() {
    this.machines = {};
  }
  create(name, config) {
    return this.machines[name] = createMachine(name, config);
  }
  get(name) {
    if (this.machines[name]) return this.machines[name];
    throw new Error(ERROR_MISSING_MACHINE(name));
  }
  flush() {
    this.machines = [];
  }
}

const factory = new MachineFactory();

export { factory as Machine };