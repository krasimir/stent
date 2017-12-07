(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stent = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// errors
var ERROR_MISSING_MACHINE = exports.ERROR_MISSING_MACHINE = function ERROR_MISSING_MACHINE(name) {
  return 'There\'s no machine with name ' + name;
};
var ERROR_MISSING_STATE = exports.ERROR_MISSING_STATE = 'Configuration error: missing initial "state"';
var ERROR_MISSING_TRANSITIONS = exports.ERROR_MISSING_TRANSITIONS = 'Configuration error: missing "transitions"';
var ERROR_WRONG_STATE_FORMAT = exports.ERROR_WRONG_STATE_FORMAT = function ERROR_WRONG_STATE_FORMAT(state) {
  var serialized = (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' ? JSON.stringify(state, null, 2) : state;

  return 'The state should be an object and it should always have at least "name" property. You passed ' + serialized;
};
var ERROR_UNCOVERED_STATE = exports.ERROR_UNCOVERED_STATE = function ERROR_UNCOVERED_STATE(state) {
  return 'You just transitioned the machine to a state (' + state + ') which is not defined or it has no actions. This means that the machine is stuck.';
};
var ERROR_NOT_SUPPORTED_HANDLER_TYPE = exports.ERROR_NOT_SUPPORTED_HANDLER_TYPE = 'Wrong handler type passed. Please read the docs https://github.com/krasimir/stent';
var ERROR_RESERVED_WORD_USED_AS_ACTION = exports.ERROR_RESERVED_WORD_USED_AS_ACTION = function ERROR_RESERVED_WORD_USED_AS_ACTION(word) {
  return 'Sorry, you can\'t use ' + word + ' as a name for an action. It is reserved.';
};

// middlewares
var MIDDLEWARE_PROCESS_ACTION = exports.MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
var MIDDLEWARE_ACTION_PROCESSED = exports.MIDDLEWARE_ACTION_PROCESSED = 'onActionProcessed';
var MIDDLEWARE_STATE_WILL_CHANGE = exports.MIDDLEWARE_STATE_WILL_CHANGE = 'onStateWillChange';
var MIDDLEWARE_PROCESS_STATE_CHANGE = exports.MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
var MIDDLEWARE_GENERATOR_STEP = exports.MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';
var MIDDLEWARE_GENERATOR_END = exports.MIDDLEWARE_GENERATOR_END = 'onGeneratorEnd';
var MIDDLEWARE_GENERATOR_RESUMED = exports.MIDDLEWARE_GENERATOR_RESUMED = 'onGeneratorResumed';
var MIDDLEWARE_MACHINE_CREATED = exports.MIDDLEWARE_MACHINE_CREATED = 'onMachineCreated';
var MIDDLEWARE_MACHINE_CONNECTED = exports.MIDDLEWARE_MACHINE_CONNECTED = 'onMachineConnected';
var MIDDLEWARE_MACHINE_DISCONNECTED = exports.MIDDLEWARE_MACHINE_DISCONNECTED = 'onMachineDisconnected';
var MIDDLEWARE_REGISTERED = exports.MIDDLEWARE_REGISTERED = 'onMiddlewareRegister';

// misc
var DEVTOOLS_KEY = exports.DEVTOOLS_KEY = '__hello__stent__';
},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = createMachine;

var _handleAction = require('./helpers/handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

var _handleActionLatest = require('./helpers/handleActionLatest');

var _handleActionLatest2 = _interopRequireDefault(_handleActionLatest);

var _validateConfig = require('./helpers/validateConfig');

var _validateConfig2 = _interopRequireDefault(_validateConfig);

var _registerMethods = require('./helpers/registerMethods');

var _registerMethods2 = _interopRequireDefault(_registerMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IDX = 0;
var getMachineID = function getMachineID() {
  return '_@@@' + ++IDX;
};

function createMachine(name, config) {
  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    if (typeof config === 'undefined') {
      config = name;
      name = getMachineID();
    } else {
      config = {
        state: name,
        transitions: config
      };
      name = getMachineID();
    }
  }

  var machine = { name: name };

  (0, _validateConfig2.default)(config);

  var _config = config,
      initialState = _config.state,
      transitions = _config.transitions;

  var dispatch = function dispatch(action) {
    for (var _len = arguments.length, payload = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      payload[_key - 1] = arguments[_key];
    }

    return _handleAction2.default.apply(undefined, [machine, action].concat(payload));
  };
  var dispatchLatest = function dispatchLatest(action) {
    for (var _len2 = arguments.length, payload = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      payload[_key2 - 1] = arguments[_key2];
    }

    return _handleActionLatest2.default.apply(undefined, [machine, action].concat(payload));
  };

  machine.state = initialState;
  machine.transitions = transitions;

  (0, _registerMethods2.default)(machine, transitions, dispatch, dispatchLatest);

  return machine;
}
module.exports = exports['default'];
},{"./helpers/handleAction":4,"./helpers/handleActionLatest":5,"./helpers/registerMethods":9,"./helpers/validateConfig":13}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.flush = flush;
exports.getMapping = getMapping;
exports.destroy = destroy;
exports.default = connect;

var _ = require('../');

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var idIndex = 0;
var mappings = null;

var getId = function getId() {
  return 'm' + ++idIndex;
};
var setup = function setup() {
  if (mappings !== null) return;
  mappings = {};
  _.Machine.addMiddleware({
    onStateChanged: function onStateChanged() {
      for (var id in mappings) {
        var _mappings$id = mappings[id],
            done = _mappings$id.done,
            machines = _mappings$id.machines;


        if (machines.map(function (m) {
          return m.name;
        }).indexOf(this.name) >= 0) {
          done && done.apply(undefined, machines);
        }
      }
    }
  });
};

function flush() {
  mappings = null;
}

function getMapping() {
  return mappings;
}

function destroy(machineId) {
  for (var mId in mappings) {
    mappings[mId].machines = mappings[mId].machines.filter(function (_ref) {
      var name = _ref.name;
      return name !== machineId;
    });
    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_DISCONNECTED, null, mappings[mId].machines);
    if (mappings[mId].machines.length === 0) {
      delete mappings[mId];
    }
  }
}

function connect() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      meta = _ref2.meta;

  setup();
  var withFunc = function withFunc() {
    for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
      names[_key] = arguments[_key];
    }

    var machines = names.map(function (name) {
      return _.Machine.get(name);
    });
    var mapFunc = function mapFunc(done, once, silent) {
      var id = getId();

      !once && (mappings[id] = { done: done, machines: machines });
      !silent && done && done.apply(undefined, machines);

      return function disconnect() {
        (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_DISCONNECTED, null, machines, meta);
        if (mappings && mappings[id]) delete mappings[id];
      };
    };

    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_CONNECTED, null, machines, meta);
    return {
      'map': mapFunc,
      'mapOnce': function mapOnce(done) {
        return mapFunc(done, true);
      },
      'mapSilent': function mapSilent(done) {
        return mapFunc(done, false, true);
      }
    };
  };

  return { 'with': withFunc };
}
},{"../":15,"../constants":1,"./handleMiddleware":7}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = handleAction;

var _constants = require('../constants');

var _updateState = require('./updateState');

var _updateState2 = _interopRequireDefault(_updateState);

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _handleGenerator = require('./handleGenerator');

var _handleGenerator2 = _interopRequireDefault(_handleGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleAction(machine, action) {
  for (var _len = arguments.length, payload = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    payload[_key - 2] = arguments[_key];
  }

  var state = machine.state,
      transitions = machine.transitions;


  if (!transitions[state.name]) return false;

  var handler = transitions[state.name][action];

  if (typeof handler === 'undefined') return false;

  _handleMiddleware2.default.apply(undefined, [_constants.MIDDLEWARE_PROCESS_ACTION, machine, action].concat(payload));

  // string as a handler
  if (typeof handler === 'string') {
    (0, _updateState2.default)(machine, _extends({}, state, { name: transitions[state.name][action] }));

    // object as a handler
  } else if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
    (0, _updateState2.default)(machine, handler);

    // function as a handler
  } else if (typeof handler === 'function') {
    var response = transitions[state.name][action].apply(machine, [machine.state].concat(payload));

    // generator
    if (response && typeof response.next === 'function') {
      var generator = response;

      return (0, _handleGenerator2.default)(machine, generator, function (response) {
        (0, _updateState2.default)(machine, response);
        _handleMiddleware2.default.apply(undefined, [_constants.MIDDLEWARE_ACTION_PROCESSED, machine, action].concat(payload));
      });
    } else {
      (0, _updateState2.default)(machine, response);
    }

    // wrong type of handler
  } else {
    throw new Error(_constants.ERROR_NOT_SUPPORTED_HANDLER_TYPE);
  }

  _handleMiddleware2.default.apply(undefined, [_constants.MIDDLEWARE_ACTION_PROCESSED, machine, action].concat(payload));
};
module.exports = exports['default'];
},{"../constants":1,"./handleGenerator":6,"./handleMiddleware":7,"./updateState":12}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = handleActionLatest;

var _handleAction = require('./handleAction');

var _handleAction2 = _interopRequireDefault(_handleAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = {};

function handleActionLatest(machine, action) {
  actions[action] && actions[action]();

  for (var _len = arguments.length, payload = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    payload[_key - 2] = arguments[_key];
  }

  actions[action] = _handleAction2.default.apply(undefined, [machine, action].concat(payload));
};
module.exports = exports['default'];
},{"./handleAction":4}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = handleGenerator;

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

var _updateState = require('./updateState');

var _updateState2 = _interopRequireDefault(_updateState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var generatorNext = function generatorNext(gen, res) {
    if (canceled) return;
    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_RESUMED, machine, res);
    return gen.next(res);
  };
  var generatorThrow = function generatorThrow(gen, error) {
    return !canceled && gen.throw(error);
  };
  var cancelGenerator = function cancelGenerator() {
    cancelInsideGenerator && cancelInsideGenerator();
    canceled = true;
  };
  var canceled = false;
  var cancelInsideGenerator;

  var iterate = function iterate(result) {
    if (canceled) return;

    if (!result.done) {
      (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_STEP, machine, result.value);

      // yield call
      if (_typeof(result.value) === 'object' && result.value.__type === 'call') {
        var _result$value = result.value,
            func = _result$value.func,
            args = _result$value.args;

        var funcResult = func.apply(machine, args);

        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(function (result) {
            return iterate(generatorNext(generator, result));
          }, function (error) {
            return iterate(generatorThrow(generator, error));
          });
          // generator
        } else if (typeof funcResult.next === 'function') {
          cancelInsideGenerator = handleGenerator(machine, funcResult, function (generatorResult) {
            iterate(generatorNext(generator, generatorResult));
          });
        } else {
          iterate(generatorNext(generator, funcResult));
        }

        // a return statement of the normal function
      } else {
        (0, _updateState2.default)(machine, result.value);
        iterate(generatorNext(generator));
      }

      // the end of the generator (return statement)
    } else {
      (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_GENERATOR_END, machine, result.value);
      done(result.value);
    }
  };

  iterate(generatorNext(generator, resultOfPreviousOperation));

  return cancelGenerator;
}
module.exports = exports['default'];
},{"../constants":1,"./handleMiddleware":7,"./updateState":12}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = handleMiddleware;

var _ = require('../');

function handleMiddleware(hook, machine) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var middlewares = _.Machine.middlewares;

  if (middlewares.length === 0) {
    return;
  }

  var loop = function loop(index, process) {
    return index < middlewares.length - 1 ? process(index + 1) : null;
  };

  (function process(index) {
    var middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, args);
    }
    loop(index, process);
  })(0);
}
module.exports = exports['default'];
},{"../":15}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = isEmptyObject;
function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}
module.exports = exports['default'];
},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = registerMethods;

var _toCamelCase = require('./toCamelCase');

var _toCamelCase2 = _interopRequireDefault(_toCamelCase);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reserved = ['name', 'transitions', 'state', 'destroy'];

function registerMethods(machine, transitions, dispatch, dispatchLatest) {
  for (var state in transitions) {

    (function (state) {
      machine[(0, _toCamelCase2.default)('is ' + state)] = function () {
        return machine.state.name === state;
      };
    })(state);

    for (var action in transitions[state]) {
      var normalized = (0, _toCamelCase2.default)(action);
      if (reserved.indexOf(normalized) >= 0) throw new Error((0, _constants.ERROR_RESERVED_WORD_USED_AS_ACTION)(normalized));
      (function (n, a) {
        machine[n] = function () {
          for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return dispatch.apply(undefined, [a].concat(payload));
        };
        machine[n].latest = function () {
          for (var _len2 = arguments.length, payload = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return dispatchLatest.apply(undefined, [a].concat(payload));
        };
      })(normalized, action);
    }
  }
}
module.exports = exports['default'];
},{"../constants":1,"./toCamelCase":10}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (text) {
  return text.toLowerCase().replace(/\W+(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
};

module.exports = exports['default'];
},{}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = uid;
function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
module.exports = exports['default'];
},{}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = updateState;

var _validateState = require('./validateState');

var _validateState2 = _interopRequireDefault(_validateState);

var _isEmptyObject = require('./isEmptyObject');

var _isEmptyObject2 = _interopRequireDefault(_isEmptyObject);

var _handleMiddleware = require('./handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateState(machine, state) {
  var newState;

  if (typeof state === 'undefined') return;
  if (typeof state === 'string' || typeof state === 'number') {
    newState = { name: state.toString() };
  } else {
    newState = (0, _validateState2.default)(state);
  }

  if (typeof machine.transitions[newState.name] === 'undefined' || (0, _isEmptyObject2.default)(machine.transitions[newState.name])) {
    throw new Error((0, _constants.ERROR_UNCOVERED_STATE)(newState.name));
  }

  (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_STATE_WILL_CHANGE, machine);

  machine.state = newState;

  (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_PROCESS_STATE_CHANGE, machine);
}
module.exports = exports['default'];
},{"../constants":1,"./handleMiddleware":7,"./isEmptyObject":8,"./validateState":14}],13:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = validateConfig;

var _constants = require('../constants');

function validateConfig(config) {
  if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') throw new Error(_constants.ERROR_MISSING_STATE);

  var state = config.state,
      transitions = config.transitions;


  if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)) !== 'object') throw new Error(_constants.ERROR_MISSING_STATE);
  if ((typeof transitions === 'undefined' ? 'undefined' : _typeof(transitions)) !== 'object') throw new Error(_constants.ERROR_MISSING_TRANSITIONS);
  return true;
}
module.exports = exports['default'];
},{"../constants":1}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = validateState;

var _constants = require('../constants');

function validateState(state) {
  if (state && (typeof state === 'undefined' ? 'undefined' : _typeof(state)) === 'object' && typeof state.name !== 'undefined') return state;
  throw new Error((0, _constants.ERROR_WRONG_STATE_FORMAT)(state));
}
module.exports = exports['default'];
},{"../constants":1}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.Machine = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createMachine = require('./createMachine');

var _createMachine2 = _interopRequireDefault(_createMachine);

var _constants = require('./constants');

var _connect = require('./helpers/connect');

var _connect2 = _interopRequireDefault(_connect);

var _handleMiddleware = require('./helpers/handleMiddleware');

var _handleMiddleware2 = _interopRequireDefault(_handleMiddleware);

var _uid = require('./helpers/uid');

var _uid2 = _interopRequireDefault(_uid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MachineFactory = function () {
  function MachineFactory() {
    _classCallCheck(this, MachineFactory);

    this.machines = {};
    this.middlewares = [];
    this.connect = _connect2.default;
  }

  MachineFactory.prototype.create = function create(name, config) {
    var _this = this;

    var machine = (0, _createMachine2.default)(name, config, this.middlewares);

    this.machines[machine.name] = machine;
    (0, _handleMiddleware2.default)(_constants.MIDDLEWARE_MACHINE_CREATED, machine, machine);
    machine.destroy = function () {
      return _this.destroy(machine);
    };
    return machine;
  };

  MachineFactory.prototype.get = function get(name) {
    if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') name = name.name;
    if (this.machines[name]) return this.machines[name];
    throw new Error((0, _constants.ERROR_MISSING_MACHINE)(name));
  };

  MachineFactory.prototype.flush = function flush() {
    this.machines = {};
    this.middlewares = [];
    (0, _connect.flush)();
  };

  MachineFactory.prototype.addMiddleware = function addMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      this.middlewares = this.middlewares.concat(middleware);
    } else {
      this.middlewares.push(middleware);
    }
    if (middleware.__initialize) middleware.__initialize(this, (0, _uid2.default)());
    if (middleware[_constants.MIDDLEWARE_REGISTERED]) middleware[_constants.MIDDLEWARE_REGISTERED]();
  };

  MachineFactory.prototype.destroy = function destroy(machine) {
    var m = machine;
    if (typeof machine === 'string') {
      m = this.machines[machine];
      if (!m) throw new Error((0, _constants.ERROR_MISSING_MACHINE)(machine));
    }
    delete this.machines[m.name];
    (0, _connect.destroy)(m.name);
  };

  return MachineFactory;
}();

var factory = new MachineFactory();

exports.Machine = factory;


if (typeof window !== 'undefined') {
  window[_constants.DEVTOOLS_KEY] = factory;
}
},{"./constants":1,"./createMachine":2,"./helpers/connect":3,"./helpers/handleMiddleware":7,"./helpers/uid":11}]},{},[15])(15)
});