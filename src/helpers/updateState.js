import validateState from './validateState';
import isEmptyObject from './isEmptyObject';
import handleMiddleware from './handleMiddleware';
import {
  MIDDLEWARE_PROCESS_STATE_CHANGE,
  MIDDLEWARE_STATE_WILL_CHANGE,
  ERROR_UNCOVERED_STATE
} from '../constants';

export default function updateState(machine, state) {  
  var newState;
  
  if (typeof state === 'undefined') return;
  if (typeof state === 'string' || typeof state === 'number') {
    newState = { name: state.toString() };
  } else {
    newState = validateState(state);
  }

  if (
    typeof machine.transitions[newState.name] === 'undefined' ||
    isEmptyObject(machine.transitions[newState.name])
  ) {
    throw new Error(ERROR_UNCOVERED_STATE(newState.name));
  }

  var handler = machine.transitions[machine.state.name]['_exit'];
  if (typeof handler === 'function')
  {
    handler.apply(machine,[machine, newState.name]);
  }

  handleMiddleware(MIDDLEWARE_STATE_WILL_CHANGE, machine);

  machine.state = newState;

  var handler = machine.transitions[newState.name]['_entry'];
  if (typeof handler === 'function')
  {
    handler.apply(machine,[machine, oldState.name]);
  }

  handleMiddleware(MIDDLEWARE_PROCESS_STATE_CHANGE, machine);

}
