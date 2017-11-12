import handleAction from './handleAction';

export default function handleActionLatest(machine, action, ...payload) {
  const generator = handleAction(machine, action, ...payload);
  console.log(generator);
  // if (generator) {
  //   console.log(generator);
  // }
};