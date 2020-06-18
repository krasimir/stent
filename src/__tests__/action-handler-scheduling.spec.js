import { Machine } from "../";
import { connect, call } from "../helpers";

const sleep = function sleep(ms = 100) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
};

const noop = function noop(machine) {
  return { ...machine.state };
};

describe("Stent machine", function() {
  beforeEach(() => {
    Machine.flush();
  });

  describe("when an async action handler is running", function() {
    this.timeout(5000);

    it("should accept state changes from other action handlers", function() {
      return new Promise(function(resolve, reject) {
        const machine = Machine.create("app", {
          state: { name: "A" },
          transitions: {
            A: {
              init: function* init(machine) {
                yield call(sleep, 100);

                yield { ...machine.state, name: "B" };

                yield call(sleep, 100);

                return yield { ...machine.state, name: "C" };
              },
              goToD: function* goToD(machine) {
                yield call(sleep, 100);

                return yield { ...machine.state, name: "D" };
              },
              syncGoToE: function syncGoToE(machine) {
                return { ...machine.state, name: "E" };
              }
            },
            B: {
              noop
            },
            C: {
              noop
            },
            D: {
              noop
            },
            E: {
              noop
            }
          }
        });

        let actual = [];

        const expected = ["A", "E", "B", "D", "C"];

        connect()
          .with(machine.name)
          .map(function(m) {
            const stateName = m.state.name;

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
