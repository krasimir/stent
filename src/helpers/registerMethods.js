import toCamelCase from './toCamelCase';
import { ERROR_RESERVED_WORD_USED_AS_ACTION } from '../constants';

const reserved = ['name', 'transitions', 'state', 'destroy'];

export default function registerMethods(machine, transitions, dispatch, dispatchLatest) {
  for(var state in transitions) {

    (function (state) {
      machine[toCamelCase(`is ${ state }`)] = function() {
        return machine.state.name === state;
      }
    })(state);

    for(var action in transitions[state]) {
      action = toCamelCase(action);
      if (reserved.indexOf(action) >= 0) throw new Error(ERROR_RESERVED_WORD_USED_AS_ACTION(action));
      (function(action) {
        machine[action] = (...payload) => dispatch(action, ...payload);
        machine[action].latest = (...payload) => dispatchLatest(action, ...payload);
      })(action);
    }

  }
}