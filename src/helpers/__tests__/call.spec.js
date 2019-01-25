import connect from "../connect";
import call from "../generators/call";
import { Machine } from "../../";

const IDLE = "IDLE";
const END = "END";
const FAILURE = "FAILURE";

const makeState = function(name = "INVALID", error = null) {
  return { name, error };
};

describe("Given the call helper", function() {
  beforeEach(() => {
    Machine.flush();
  });
  describe("when calling it with a non-function argument", function() {
    it("should catch the error and transition to Failure state with a meaningful error message", function(done) {
      const missingFunc = undefined;
      const errMessage = "The argument passed to `call` is falsy (undefined)";

      const machine = Machine.create("A", {
        state: makeState(IDLE),
        transitions: {
          [IDLE]: {
            run: function* run() {
              try {
                // throw new Error(errMessage)
                yield call(missingFunc);
                yield makeState(END);
              } catch (e) {
                yield makeState(FAILURE, e);
              }
            }
          },
          [END]: {
            reload: makeState(IDLE)
          },
          [FAILURE]: {
            reload: makeState(IDLE)
          }
        }
      });

      connect()
        .with("A")
        .mapSilent(A => {
          expect(A.state.name).to.equal(FAILURE);
          expect(A.state.error.message).to.equal(errMessage);
          done();
        });

      machine.run();
    });
  });
});
