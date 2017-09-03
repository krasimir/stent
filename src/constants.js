// errors
export const ERROR_MISSING_MACHINE = name => `There's no machine with name ${ name }`;
export const ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
export const ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
export const ERROR_MISSING_ACTION_IN_STATE = (action, state) => `"${ action }" action is not available in "${ state }" state`;