import toCamelCase from './helpers/toCamelCase';
import {
  ERROR_MISSING_STATE,
  ERROR_MISSING_TRANSITIONS
} from './constants';
import handleAction from './handleAction';

var IDX = 0;
const getMachineID = () => `_${ ++IDX }`;

export function registerMethods(machine, transitions, dispatch) {
  for(var state in transitions) {

    (function (state) {
      machine[toCamelCase('is ' + state)] = function() {
        return machine.state.name === state;
      }
    })(state);

    for(var action in transitions[state]) {
      (function(action) {
        machine[toCamelCase(action)] = (...payload) => dispatch(action, ...payload);
      })(action);
    }

  }
}

export function validateConfig(config) {
  if (typeof config !== 'object') throw new Error(ERROR_MISSING_STATE);
  
  const { state, transitions } = config;

  if (typeof state !== 'object') throw new Error(ERROR_MISSING_STATE);
  if (typeof transitions !== 'object') throw new Error(ERROR_MISSING_TRANSITIONS);
  return true;
}

export default function createMachine(name, config) {
  if (typeof name === 'object') {
    config = name;
    name = getMachineID();
  }

  const machine = { name };

  if (validateConfig(config)) {
    const { state: initialState, transitions } = config;
    
    machine.state = initialState;
    machine.transitions = transitions;

    registerMethods(
      machine,
      transitions,
      (action, ...payload) => handleAction(machine, action, ...payload)
    );
  }
  
  return machine;
}
