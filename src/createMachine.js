import handleAction from './handleAction';
import validateConfig from './helpers/validateConfig';
import registerMethods from './helpers/registerMethods';

var IDX = 0;
const getMachineID = () => `_${ ++IDX }`;

export default function createMachine(name, config) {
  if (typeof name === 'object') {
    if (typeof config === 'undefined') {
      config = name;
      name = getMachineID();
    } else {
      config = {
        state: name,
        transitions: config
      }
      name = getMachineID();
    }
  }

  const machine = { name };

  validateConfig(config);

  const { state: initialState, transitions } = config;
  
  machine.state = initialState;
  machine.transitions = transitions;

  registerMethods(
    machine,
    transitions,
    (action, ...payload) => handleAction(machine, action, ...payload)
  );
  
  return machine;
}
