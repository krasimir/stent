import CircularJSON from 'circular-json';

const getMachines = function () {
  return Object.keys(DevTools.Machine.machines)
    .map(name => ({ name, state: sanitize(DevTools.Machine.machines[name].state) }));
}
const message = data => {
  if (window && window.top && window.top.postMessage) {
    window.top.postMessage({
      source: 'stent',
      time: (new Date()).getTime(),
      machines: getMachines(),
      ...data
    }, '*');
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
    result = JSON.parse(CircularJSON.stringify(something, function (key, value) {
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
    middlewares: DevTools.Machine.middlewares.length
  });
};
  
const DevTools = {
  onMachineCreated(machine) {
    message({
      type: 'onMachineCreated',
      machine: sanitize(machine),
      meta: getMetaInfo()
    });
  },
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
  onMachineConnected(machines, meta) {
    message({
      type: 'onMachineConnected',
      meta: getMetaInfo({ ...meta, ...{ machines: sanitize(machines) }})
    });
  },
  onMachineDisconnected(machines, meta) {
    message({
      type: 'onMachineDisconnected',
      meta: getMetaInfo({ ...meta, ...{ machines: sanitize(machines) }})
    });
  },
  onMiddlewareRegister() {
    message({ pageRefresh: true });
  }
};

export default DevTools;