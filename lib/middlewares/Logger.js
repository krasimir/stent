"use strict";

exports.__esModule = true;
var Logger = {
  onActionDispatched: function onActionDispatched(next, actionName) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (args.length === 0) {
      console.log(this.name + ": \"" + actionName + "\" dispatched");
    } else {
      console.log(this.name + ": \"" + actionName + "\" dispatched with payload " + args);
    }
    next();
  },
  onStateChanged: function onStateChanged(next) {
    next();
    console.log(this.name + ": state changed to \"" + this.state.name + "\"");
  }
};

exports.default = Logger;
module.exports = exports['default'];