import {
  ERROR_MISSING_STATE,
  ERROR_MISSING_TRANSITIONS
} from '../constants';

export default function validateConfig(config) {
  if (typeof config !== 'object') throw new Error(ERROR_MISSING_STATE);
  
  const { state, transitions } = config;

  if (typeof state !== 'object') throw new Error(ERROR_MISSING_STATE);
  if (typeof transitions !== 'object') throw new Error(ERROR_MISSING_TRANSITIONS);
  return true;
}