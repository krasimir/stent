import handleAction from './handleAction';

export default function handleActionLatest(machine, action, ...payload) {
  return handleAction(machine, action, ...payload);
};