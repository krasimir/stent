import { stringify } from '../helpers/vendors/CircularJSON';

var Machine, idx = 0;

const getUID = () => (++idx);

const message = (data) => {
  if (window && window.top && window.top.postMessage) {
    const machines = Object.keys(Machine.machines)
      .map(name => ({ name, state: sanitize(Machine.machines[name].state) }));

    window.top.postMessage({
      source: 'stent',
      uid: getUID(),
      time: (new Date()).getTime(),
      machines,
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
      y = sanitize(yielded);
    } catch(error) {
      y = { __type: 'call' };
    }
    y.func = funcName;
  }

  return y;
}
const sanitize = (something, showErrorInConsole = false) => {
  var result;

  try {
    result = JSON.parse(stringify(something, function (key, value) {
      if (typeof value === 'function') {
        return { __func: value.name === '' ? '<anonymous>' : value.name };
      }
      return value;
    }));
  } catch(error) {
    if (showErrorInConsole) {
      console.log(error);
    }
    result = null;
  }
  return result;
}
const getMetaInfo = meta => {
  return Object.assign({}, meta, {
    middlewares: Machine.middlewares.length
  });
};
  
const DevTools = {
  __sanitize: sanitize,
  __formatYielded: formatYielded,
  __message: message,
  __api(m) {
    Machine = m;
  },
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
  onGeneratorEnd(value) {
    message({
      type: 'onGeneratorEnd',
      value: sanitize(value),
      meta: getMetaInfo()
    });
  },
  onGeneratorResumed(value) {
    message({
      type: 'onGeneratorResumed',
      value: sanitize(value),
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