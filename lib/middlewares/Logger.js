"use strict";

exports.__esModule = true;
var Logger = {
  onActionDispatched: function onActionDispatched(actionName) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (args.length === 0) {
      console.log(this.name + ": \"" + actionName + "\" dispatched");
    } else {
      console.log(this.name + ": \"" + actionName + "\" dispatched with payload " + args);
    }
  },
  onStateChanged: function onStateChanged() {
    console.log(this.name + ": state changed to \"" + this.state.name + "\"");
  },
  onGeneratorStep: function onGeneratorStep(yielded) {
    console.log(this.name + ": generator step -> " + yielded);
  }
};

exports.default = Logger;
module.exports = exports['default'];