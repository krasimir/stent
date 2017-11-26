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
      const normalized = toCamelCase(action);
      if (reserved.indexOf(normalized) >= 0) throw new Error(ERROR_RESERVED_WORD_USED_AS_ACTION(normalized));
      (function(n, a) {
        machine[n] = (...payload) => dispatch(a, ...payload);
        machine[n].latest = (...payload) => dispatchLatest(a, ...payload);
      })(normalized, action);
    }

  }
}