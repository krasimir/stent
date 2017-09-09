// errors
export const ERROR_MISSING_MACHINE = name => `There's no machine with name ${ name }`;
export const ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
export const ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
export const ERROR_MISSING_ACTION_IN_STATE = (action, state, payload = '') => {
  const payloadInfo = payload !== '' ? ` Payload of the action: ${ payload }` : '';

  return `"${ action }" action is not available in "${ state }" state.${ payloadInfo }`;
}
export const ERROR_WRONG_STATE_FORMAT = state => {
  const serialized = typeof state === 'object' ? JSON.stringify(state, null, 2) : state;

  return `The state should be an object and it should always have at least "name" property. You passed ${ serialized }`;
}
export const ERROR_UNCOVERED_STATE = state => `You just transitioned the machine to a state (${ state }) which is not defined or it has no actions. This means that the machine is stuck.`;

// other
export const WAIT_LISTENERS_STORAGE = '___@wait';