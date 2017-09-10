export default function wait(...actions) {
  if (actions.length === 1) {
    actions = actions[0];
    if (!Array.isArray(actions)) actions = [actions];
  }
  return { __type: 'wait', actions };
};
