import { ERROR_MISSING_ACTION_IN_STATE } from './constants';

export default function handleAction(machine, action, payload) {
  const { state, transitions } = machine;

  if (!transitions[state.name]) {
    return false;
  }

  const handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    throw new Error(ERROR_MISSING_ACTION_IN_STATE(action, state.name));
  }

  // string as a handler
  if (typeof handler === 'string') {
    state.name = transitions[state.name][action];
  
    // function as a handler
  } else if (typeof handler === 'function') {
    machine.state = transitions[state.name][action].apply(machine, [ machine.state, payload ]);
  }

  return true;
};
