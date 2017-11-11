import {
  ERROR_UNCOVERED_STATE,
  ERROR_NOT_SUPPORTED_HANDLER_TYPE,
  TRANSITIONS_STORAGE
} from './constants';
import validateState from './helpers/validateState';
import { Machine } from './';

const MIDDLEWARE_PROCESS_ACTION = 'onActionDispatched';
const MIDDLEWARE_PROCESS_STATE_CHANGE = 'onStateChanged';
const MIDDLEWARE_GENERATOR_STEP = 'onGeneratorStep';

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) return false;
  }
  return true;
}

function handleGenerator(machine, generator, done, resultOfPreviousOperation) {
  const iterate = function (result) {
    handleMiddleware(() => {
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
    }, MIDDLEWARE_GENERATOR_STEP, machine, result.value);
  };

  iterate(generator.next(resultOfPreviousOperation));
}

function updateState(machine, response) {  
  var newState;
  
  if (typeof response === 'undefined') return;
  if (typeof response === 'string' || typeof response === 'number') {
    newState = { name: response.toString() };
  } else {
    newState = validateState(response);
  }

  if (
    typeof machine.transitions[newState.name] === 'undefined' ||
    isEmptyObject(machine.transitions[newState.name])
  ) {
    throw new Error(ERROR_UNCOVERED_STATE(newState.name));
  }

  handleMiddleware(() => {
    machine.state = newState;
  }, MIDDLEWARE_PROCESS_STATE_CHANGE, machine);
}

function handleMiddleware(done, hook, machine, ...args) {
  const middlewares = Machine.middlewares;
  
  if (middlewares.length === 0) return done();

  const loop = (index, process) => index < middlewares.length - 1 ? process(index + 1) : done();

  (function process(index) {
    const middleware = middlewares[index];

    if (middleware && typeof middleware[hook] !== 'undefined') {
      middleware[hook].apply(machine, [ () => loop(index, process), ...args ]);
    } else {
      loop(index, process);
    }
  })(0);
}

export default function handleAction(machine, action, ...payload) {
  const { state, transitions } = machine;

  if (!transitions[state.name]) {
    return false;
  }

  const handler = transitions[state.name][action];

  if (typeof transitions[state.name][action] === 'undefined') {
    return false;
  }

  handleMiddleware(() => {  
    // string as a handler
    if (typeof handler === 'string') {
      updateState(machine, { ...state, name: transitions[state.name][action] });
      
    // object as a handler
    } else if (typeof handler === 'object') {
      updateState(machine, validateState(handler));
  
    // function as a handler
    } else if (typeof handler === 'function') {
      var response = transitions[state.name][action].apply(machine, [ machine.state, ...payload ]);
  
      if (response && typeof response.next === 'function') {
        handleGenerator(machine, response, response => {
          updateState(machine, response);
        });
      } else {
        updateState(machine, response);
      }

    // wrong type of handler
    } else {
      throw new Error(ERROR_NOT_SUPPORTED_HANDLER_TYPE);
    }

  }, MIDDLEWARE_PROCESS_ACTION, machine, action, ...payload);

  return true;
};
