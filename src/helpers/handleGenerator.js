import handleMiddleware from './handleMiddleware';
import { MIDDLEWARE_GENERATOR_STEP } from '../constants';
import updateState from './updateState';

export default function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  var canceled = false;
  const cancelGenerator = () => (canceled = true);

  const iterate = function (result) {

    handleMiddleware(MIDDLEWARE_GENERATOR_STEP, machine, result.value);

    if (!result.done) {

      // yield call
      if (typeof result.value === 'object' && result.value.__type === 'call') {
        const { func, args } = result.value;
        const funcResult = func.apply(machine, args);
        
        // promise
        if (typeof funcResult.then !== 'undefined') {
          funcResult.then(
            result => iterate(generator.next(result)),
            error => iterate(generator.throw(error))
          );
        // generator
        } else if (typeof funcResult.next === 'function') {
          handleGenerator(machine, funcResult, generatorResult => {
            iterate(generator.next(generatorResult));
          });
        } else {
          iterate(generator.next(funcResult));
        }

      // a return statement of the normal function
      } else {
        updateState(machine, result.value);
        iterate(generator.next());
      }
    
    // the end of the generator (return statement)
    } else {
      done(result.value);
    }
  };

  iterate(generator.next(resultOfPreviousOperation));

  return cancelGenerator;
}