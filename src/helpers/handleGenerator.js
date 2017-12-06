import handleMiddleware from './handleMiddleware';
import { MIDDLEWARE_GENERATOR_STEP, MIDDLEWARE_GENERATOR_END, MIDDLEWARE_GENERATOR_RESUMED } from '../constants';
import updateState from './updateState';

export default function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  const generatorNext = (gen, res) => {
    if (canceled) return;
    handleMiddleware(MIDDLEWARE_GENERATOR_RESUMED, machine, res);
    return gen.next(res);
  };
  const generatorThrow = (gen, error) => !canceled && gen.throw(error);
  const cancelGenerator = () => {
    cancelInsideGenerator && cancelInsideGenerator();
    canceled = true;
  }
  var canceled = false;
  var cancelInsideGenerator;

  const iterate = function (result) {
    if (canceled) return;
    
    if (!result.done) {
      handleMiddleware(MIDDLEWARE_GENERATOR_STEP, machine, result.value);

      // yield call
      if (typeof result.value === 'object' && result.value.__type === 'call') {
        const { func, args } = result.value;
        const funcResult = func.apply(machine, args);
        
        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(
            result => iterate(generatorNext(generator, result)),
            error => iterate(generatorThrow(generator, error))
          );
        // generator
        } else if (typeof funcResult.next === 'function') {
          cancelInsideGenerator = handleGenerator(machine, funcResult, generatorResult => {
            iterate(generatorNext(generator, generatorResult));
          });
        } else {
          iterate(generatorNext(generator, funcResult));
        }

      // a return statement of the normal function
      } else {
        updateState(machine, result.value);
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