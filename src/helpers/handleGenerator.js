import handleMiddleware from "./handleMiddleware";
import {
  MIDDLEWARE_GENERATOR_STEP,
  MIDDLEWARE_GENERATOR_END,
  MIDDLEWARE_GENERATOR_RESUMED,
  ERROR_GENERATOR_FUNC_CALL_FAILED
} from "../constants";
import updateState from "./updateState";

export default function handleGenerator(
  machine,
  generator,
  done,
  resultOfPreviousOperation
) {
  const generatorNext = (gen, res) => !canceled && gen.next(res);
  const generatorThrow = (gen, error) => !canceled && gen.throw(error);
  const cancelGenerator = () => {
    cancelInsideGenerator && cancelInsideGenerator();
    canceled = true;
  };
  var canceled = false;
  var cancelInsideGenerator;

  const iterate = function(result) {
    if (canceled) return;

    if (!result.done) {
      handleMiddleware(MIDDLEWARE_GENERATOR_STEP, machine, result.value);

      // yield call
      if (typeof result.value === "object" && result.value.__type === "call") {
        const { func, args } = result.value;

        if (!func) {
          const error = ERROR_GENERATOR_FUNC_CALL_FAILED(typeof func);
          handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine, error);
          return iterate(generatorThrow(generator, new Error(error)));
        }

        const funcResult = func(...args);

        if (!funcResult) {
          handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine);
          iterate(generatorNext(generator));
          return;
        }

        // promise
        if (typeof funcResult.then !== "undefined") {
          funcResult.then(
            result => {
              handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine, result);
              return iterate(generatorNext(generator, result));
            },
            error => {
              handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine, error);
              return iterate(generatorThrow(generator, error));
            }
          );
          // generator
        } else if (typeof funcResult.next === "function") {
          try {
            cancelInsideGenerator = handleGenerator(
              machine,
              funcResult,
              generatorResult => {
                handleMiddleware(
                  MIDDLEWARE_GENERATOR_RESUMED,
                  machine,
                  generatorResult
                );
                iterate(generatorNext(generator, generatorResult));
              }
            );
          } catch (error) {
            return iterate(generatorThrow(generator, error));
          }
        } else {
          handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine, funcResult);
          iterate(generatorNext(generator, funcResult));
        }

        // a return statement of the normal function
      } else {
        updateState(machine, result.value);
        handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine);
        iterate(generatorNext(generator));
      }

      // the end of the generator (return statement)
    } else {
      handleMiddleware(MIDDLEWARE_GENERATOR_END, machine, result.value);
      done(result.value);
    }
  };

  iterate(generatorNext(generator, resultOfPreviousOperation));

  return cancelGenerator;
}
