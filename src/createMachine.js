import toCamelCase from './helpers/toCamelCase';
import {
  ERROR_MISSING_STATE,
  ERROR_MISSING_TRANSITIONS,
  MIDDLEWARE_STORAGE
} from './constants';
import handleAction from './handleAction';

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

export function validateConfig({ state, transitions }) {
  if (typeof state !== 'object') throw new Error(ERROR_MISSING_STATE);
  if (typeof transitions !== 'object') throw new Error(ERROR_MISSING_TRANSITIONS);
  return true;
}

export default function createMachine(name, config, middlewares) {
  const machine = {
    name,
    [MIDDLEWARE_STORAGE]: middlewares
  };
  const { state: initialState, transitions } = config;

  machine.state = initialState;
  machine.transitions = transitions;

  if (validateConfig(config)) {
    registerMethods(
      machine,
      transitions,
      (action, ...payload) => handleAction(machine, action, ...payload)
    );
  }
  
  return machine;
}
