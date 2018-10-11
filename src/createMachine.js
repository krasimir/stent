import handleAction from './helpers/handleAction';
import handleActionLatest from './helpers/handleActionLatest';
import validateConfig from './helpers/validateConfig';
import registerMethods from './helpers/registerMethods';

var IDX = 0;
const getMachineID = () => `_@@@${ ++IDX }`;

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

  const { state: initialState, transitions} = config;
  const dispatch = (action, ...payload) => handleAction(machine, action, ...payload);
  const dispatchLatest = (action, ...payload) => handleActionLatest(machine, action, ...payload);

  machine.state = initialState;
  machine.transitions = transitions;

  registerMethods(
    machine,
    transitions,
    dispatch,
    dispatchLatest
  );

  return machine;
}
