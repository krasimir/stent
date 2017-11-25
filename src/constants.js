// errors
export const ERROR_MISSING_MACHINE = name => `There's no machine with name ${ name }`;
export const ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
export const ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
export const ERROR_WRONG_STATE_FORMAT = state => {
  const serialized = typeof state === 'object' ? JSON.stringify(state, null, 2) : state;

  return `The state should be an object and it should always have at least "name" property. You passed ${ serialized }`;
}
export const ERROR_UNCOVERED_STATE = state => `You just transitioned the machine to a state (${ state }) which is not defined or it has no actions. This means that the machine is stuck.`;
export const ERROR_NOT_SUPPORTED_HANDLER_TYPE = 'Wrong handler type passed. Please read the docs https://github.com/krasimir/stent';

// middlewares
export const MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
export const MIDDLEWARE_ACTION_PROCESSED = 'onActionProcessed';
export const MIDDLEWARE_STATE_WILL_CHANGE = 'onStateWillChange';
export const MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
export const MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';

// misc

export const DEVTOOLS_KEY = '__hello__stent__';