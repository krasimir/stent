export default function wait(actions) {
  if (!Array.isArray(actions)) actions = [actions];
  return { __type: 'wait', actions };
};
