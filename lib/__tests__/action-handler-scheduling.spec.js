"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require("../");

var _helpers = require("../helpers");

var sleep = function sleep() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};

var noop = function noop(machine) {
  return _extends({}, machine.state);
};

describe("Stent machine", function () {
  beforeEach(function () {
    _.Machine.flush();
  });

  describe("when an async action handler is running", function () {
    this.timeout(5000);

    it("should accept state changes from other action handlers", function () {
      return new Promise(function (resolve, reject) {
        var machine = _.Machine.create("app", {
          state: { name: "A" },
          transitions: {
            A: {
              init: /*#__PURE__*/regeneratorRuntime.mark(function init(machine) {
                return regeneratorRuntime.wrap(function init$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return (0, _helpers.call)(sleep, 100);

                      case 2:
                        _context.next = 4;
                        return _extends({}, machine.state, { name: "B" });

                      case 4:
                        _context.next = 6;
                        return (0, _helpers.call)(sleep, 100);

                      case 6:
                        _context.next = 8;
                        return _extends({}, machine.state, { name: "C" });

                      case 8:
                        return _context.abrupt("return", _context.sent);

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, init, this);
              }),
              goToD: /*#__PURE__*/regeneratorRuntime.mark(function goToD(machine) {
                return regeneratorRuntime.wrap(function goToD$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return (0, _helpers.call)(sleep, 100);

                      case 2:
                        _context2.next = 4;
                        return _extends({}, machine.state, { name: "D" });

                      case 4:
                        return _context2.abrupt("return", _context2.sent);

                      case 5:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, goToD, this);
              }),
              syncGoToE: function syncGoToE(machine) {
                return _extends({}, machine.state, { name: "E" });
              }
            },
            B: {
              noop: noop
            },
            C: {
              noop: noop
            },
            D: {
              noop: noop
            },
            E: {
              noop: noop
            }
          }
        });

        var actual = [];

        var expected = ["A", "E", "B", "D", "C"];

        (0, _helpers.connect)().with(machine.name).map(function (m) {
          var stateName = m.state.name;

          actual.push(stateName);

          if (stateName === "C") {
            try {
              expect(actual).to.deep.equal(expected);
              resolve();
            } catch (err) {
              reject(err);
            }
          }
        });

        machine.init();
        machine.goToD();
        machine.syncGoToE();
      });
    });
  });
});