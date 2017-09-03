import { ERROR_WRONG_STATE_FORMAT } from '../constants';

export default function validateState(state) {
  if (state && typeof state === 'object' && typeof state.name !== 'undefined') return state;
  throw new Error(ERROR_WRONG_STATE_FORMAT(state));  
}