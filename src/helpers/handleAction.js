import {
  ERROR_UNCOVERED_STATE,
  ERROR_NOT_SUPPORTED_HANDLER_TYPE,
  TRANSITIONS_STORAGE,
  MIDDLEWARE_PROCESS_ACTION,
  MIDDLEWARE_ACTION_PROCESSED
} from '../constants';
import updateState from './updateState';
import handleMiddleware from './handleMiddleware';
import handleGenerator from './handleGenerator';

export default function handleAction(machine, action, ...payload) {
  const { state, transitions } = machine;

  if (!transitions[state.name]) return false;

  const handler = transitions[state.name][action];

  if (typeof handler === 'undefined') return false;

  handleMiddleware(MIDDLEWARE_PROCESS_ACTION, machine, action, ...payload);
  
  // string as a handler
  if (typeof handler === 'string') {
    updateState(machine, { ...state, name: transitions[state.name][action] });
    
  // object as a handler
  } else if (typeof handler === 'object') {
    updateState(machine, handler);

  // function as a handler
  } else if (typeof handler === 'function') {
    var response = transitions[state.name][action].apply(machine, [ machine.state, ...payload ]);

    // generator
    if (response && typeof response.next === 'function') {
      const generator = response;

      return handleGenerator(machine, generator, response => {
        updateState(machine, response);
      });
    } else {
      updateState(machine, response);
    }

    
  // wrong type of handler
  } else {
    throw new Error(ERROR_NOT_SUPPORTED_HANDLER_TYPE);
  }

  handleMiddleware(MIDDLEWARE_ACTION_PROCESSED, machine, action, ...payload);
};
