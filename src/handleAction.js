import { ERROR_MISSING_ACTION_IN_STATE } from './constants';
import validateState from './helpers/validateState';

function handleGenerator(machine, generator) {
  const result = generator.next();

  if (!result.done) {
    updateState(machine, result.value);
    return handleGenerator(machine, generator);
  }
  return result.value;
}

function updateState(machine, response) {
  if (typeof response === 'undefined') return;
  if (typeof response === 'string') {
    machine.state = { name: response };
  } else {
    machine.state = validateState(response);
  }
}

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
    
  // object as a handler
  } else if (typeof handler === 'object') {
    machine.state = validateState(handler);

  // function as a handler
  } else if (typeof handler === 'function') {
    var response = transitions[state.name][action].apply(machine, [ machine.state, payload ]);

    if (response && typeof response.next === 'function') {
      response = handleGenerator(machine, response);
    }
    
    updateState(machine, response);

  }

  return true;
};
