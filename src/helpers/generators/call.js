export default function call(func, ...args) {
  return { __type: 'call', func, args };
};
