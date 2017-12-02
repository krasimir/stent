import { Machine } from '../';

const message = data => {
  if (window && window.top && window.top.postMessage) {
    window.top.postMessage({ source: 'stent', ...data }, '*');
  } else {
    console.error('There is no window.postMessage available');
  }
}
const formatYielded = yielded => {
  var y = yielded;
  
  if (yielded && yielded.__type === 'call') {
    var funcName = yielded.func.name;
    if (funcName === '') { funcName = '<anonymous>' };
    try {
      y = JSON.parse(JSON.stringify(yielded));
    } catch(error) {
      y = { __type: 'call' };
    }
    y.func = funcName;
  }

  return y;
}
const sanitize = something => {
  var result;
  try {
    result = JSON.parse(JSON.stringify(something, function (key, value) {
      if (typeof value === 'function') {
        return { __func: value.name === '' ? '<anonymous>' : value.name };
      }
      return value;
    }));
  } catch(error) {
    result = null;
  }
  return result;
}
const getMetaInfo = meta => {
  return Object.assign({}, meta, {
    machines: Object.keys(Machine.machines).length,
    middlewares: Machine.middlewares.length
  });
};
  
const DevTools = {
  onActionDispatched(actionName, ...args) {
    message({
      type: 'onActionDispatched',
      actionName,
      args: sanitize(args),
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onActionProcessed(actionName, ...args) {
    message({
      type: 'onActionProcessed',
      actionName,
      args: sanitize(args),
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onStateWillChange() {
    message({
      type: 'onStateWillChange',
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onStateChanged() {
    message({
      type: 'onStateChanged',
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onGeneratorStep(yielded) {
    message({
      type: 'onGeneratorStep',
      yielded: formatYielded(yielded),
      meta: getMetaInfo()
    });
  },
  onMachineCreated(machine) {
    message({
      type: 'onMachineCreated',
      machine: sanitize(machine),
      meta: getMetaInfo()
    });
  },
  onMachineConnected(machines, meta) {
    message({
      type: 'onMachineConnected',
      machines: sanitize(machines),
      meta: getMetaInfo(meta)
    });
  },
  onMachineDisconnected(machines, meta) {
    message({
      type: 'onMachineDisconnected',
      machines: sanitize(machines),
      meta: getMetaInfo(meta)
    });
  },
  onMiddlewareRegister() {
    message({ pageRefresh: true });
  }
};

export default DevTools;