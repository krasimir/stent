import handleAction from './handleAction';

const actions = {};

export default function handleActionLatest(machine, action, ...payload) {
  actions[action] && actions[action]();
  actions[action] = handleAction(machine, action, ...payload);
};