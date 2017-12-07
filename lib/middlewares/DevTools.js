'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _CircularJSON = require('../helpers/vendors/CircularJSON');

var _SerializeError = require('../helpers/vendors/SerializeError');

var _SerializeError2 = _interopRequireDefault(_SerializeError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Machine,
    idx = 0,
    uid;

var getUID = function getUID() {
  return ++idx;
};

var message = function message(data) {
  if (window && window.top && window.top.postMessage) {
    var machines = Object.keys(Machine.machines).map(function (name) {
      return { name: name, state: sanitize(Machine.machines[name].state) };
    });

    window.top.postMessage(_extends({
      source: 'stent',
      time: new Date().getTime(),
      uid: uid,
      machines: machines
    }, data), '*');
  } else {
    console.error('There is no window.postMessage available');
  }
};
var formatYielded = function formatYielded(yielded) {
  var y = yielded;

  if (yielded && yielded.__type === 'call') {
    var funcName = yielded.func.name;
    if (funcName === '') {
      funcName = '<anonymous>';
    };
    try {
      y = sanitize(yielded);
    } catch (error) {
      y = { __type: 'call' };
    }
    y.func = funcName;
  }

  return y;
};
var sanitize = function sanitize(something) {
  var showErrorInConsole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var result;

  try {
    result = JSON.parse((0, _CircularJSON.stringify)(something, function (key, value) {
      if (typeof value === 'function') {
        return { __func: value.name === '' ? '<anonymous>' : value.name };
      }
      if (value instanceof Error) {
        return (0, _SerializeError2.default)(value);
      }
      return value;
    }));
  } catch (error) {
    if (showErrorInConsole) {
      console.log(error);
    }
    result = null;
  }
  return result;
};
var getMetaInfo = function getMetaInfo(meta) {
  return Object.assign({}, meta, {
    middlewares: Machine.middlewares.length
  });
};

var DevTools = {
  __sanitize: sanitize,
  __formatYielded: formatYielded,
  __message: message,
  __initialize: function __initialize(m, uniqueId) {
    Machine = m;
    uid = uniqueId;
  },
  onMachineCreated: function onMachineCreated(machine) {
    message({
      type: 'onMachineCreated',
      machine: sanitize(machine),
      meta: getMetaInfo()
    });
  },
  onActionDispatched: function onActionDispatched(actionName) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    message({
      type: 'onActionDispatched',
      actionName: actionName,
      args: sanitize(args),
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onActionProcessed: function onActionProcessed(actionName) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    message({
      type: 'onActionProcessed',
      actionName: actionName,
      args: sanitize(args),
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onStateWillChange: function onStateWillChange() {
    message({
      type: 'onStateWillChange',
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onStateChanged: function onStateChanged() {
    message({
      type: 'onStateChanged',
      machine: sanitize(this),
      meta: getMetaInfo()
    });
  },
  onGeneratorStep: function onGeneratorStep(yielded) {
    message({
      type: 'onGeneratorStep',
      yielded: formatYielded(yielded),
      meta: getMetaInfo()
    });
  },
  onGeneratorEnd: function onGeneratorEnd(value) {
    message({
      type: 'onGeneratorEnd',
      value: sanitize(value),
      meta: getMetaInfo()
    });
  },
  onGeneratorResumed: function onGeneratorResumed(value) {
    message({
      type: 'onGeneratorResumed',
      value: sanitize(value),
      meta: getMetaInfo()
    });
  },
  onMachineConnected: function onMachineConnected(machines, meta) {
    message({
      type: 'onMachineConnected',
      meta: getMetaInfo(_extends({}, meta, { machines: sanitize(machines) }))
    });
  },
  onMachineDisconnected: function onMachineDisconnected(machines, meta) {
    message({
      type: 'onMachineDisconnected',
      meta: getMetaInfo(_extends({}, meta, { machines: sanitize(machines) }))
    });
  },
  onMiddlewareRegister: function onMiddlewareRegister() {
    message({
      pageRefresh: true
    });
  }
};

exports.default = DevTools;
module.exports = exports['default'];