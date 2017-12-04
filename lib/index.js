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
    middleware.Machine = this;
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