import {
  ERROR_UNCOVERED_STATE,
  ERROR_NOT_SUPPORTED_HANDLER_TYPE,
  TRANSITIONS_STORAGE,
  MIDDLEWARE_PROCESS_ACTION
} from './constants';
import updateState from './helpers/updateState';
import handleMiddleware from './helpers/handleMiddleware';
import handleGenerator from './helpers/handleGenerator';

export default function handleAction(machine, action, ...payload) {
  const { state, transitions } = machine;

  if (!transitions[state.name]) return false;

  const handler = transitions[state.name][action];

  if (typeof handler === 'undefined') return false;

  handleMiddleware(() => {
    // string as a handler
    if (typeof handler === 'string') {
      updateState(machine, { ...state, name: transitions[state.name][action] });
      
    // object as a handler
    } else if (typeof handler === 'object') {
      updateState(machine, handler);
  
    // function as a handler
    } else if (typeof handler === 'function') {
      var response = transitions[state.name][action].apply(machine, [ machine.state, ...payload ]);
  
      if (response && typeof response.next === 'function') {
        handleGenerator(machine, response, response => {
          updateState(machine, response);
        });
      } else {
        updateState(machine, response);
      }

    // wrong type of handler
    } else {
      throw new Error(ERROR_NOT_SUPPORTED_HANDLER_TYPE);
    }

  }, MIDDLEWARE_PROCESS_ACTION, machine, action, ...payload);

  return true;
};
