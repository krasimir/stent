import {
  ERROR_MISSING_ACTION_IN_STATE,
  ERROR_UNCOVERED_STATE,
  ERROR_NOT_SUPPORTED_HANDLER_TYPE,
  WAIT_LISTENERS_STORAGE,
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
          const funcResult = func(...args);
          
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

        // yield wait
        } else if (typeof result.value === 'object' && result.value.__type === 'wait') {
          waitFor(machine, result.value.actions, result => iterate(generator.next(result)));

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

function waitFor(machine, actions, done) {
  if (!machine[WAIT_LISTENERS_STORAGE]) machine[WAIT_LISTENERS_STORAGE] = [];
  machine[WAIT_LISTENERS_STORAGE].push({ actions, done, result: [...actions] });
}

// The wait of how `wait` is implemented is that we store listeners
// in machine[WAIT_LISTENERS_STORAGE]. Every time when we dispatch an action
// we are trying to flush these listeners. Once there are no more in the current
// item we are calling `next` function of the generator.
function flushListeners(machine, action, ...payload) {
  if (!machine[WAIT_LISTENERS_STORAGE] || machine[WAIT_LISTENERS_STORAGE].length === 0) return;

  // We register the `done` functions that should be called
  // because this should happen at the very end of the
  // listeners processing.
  const callbacks = [];

  machine[WAIT_LISTENERS_STORAGE] = 
    machine[WAIT_LISTENERS_STORAGE].filter(({ actions, done, result }) => {
      const actionIndex = actions.indexOf(action);

      if (actionIndex === -1) return true;

      // Result here is an array that acts as a marker
      // to find out at which index we have to return the payload
      // of the action. That's when we have an array of actions to wait.
      result[result.indexOf(action)] = payload;
      actions.splice(actionIndex, 1);
      if (actions.length === 0) {
        result.length === 1 ?
          callbacks.push(done.bind(null, result[0])) :
          callbacks.push(done.bind(null, result));
        return false;
      }
      return true;
    });
  callbacks.forEach(c => c());

  // Clean up. There is no need to keep that temporary array
  // if all the listeners are flushed out.
  if (machine[WAIT_LISTENERS_STORAGE].length === 0) delete machine[WAIT_LISTENERS_STORAGE];
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
    // Maybe run the machine in a strict mode where dispatching an action
    // which is missing in the current state throws an error
    // throw new Error(ERROR_MISSING_ACTION_IN_STATE(action, state.name, payload.join(',')));
    return false;
  }

  handleMiddleware(() => {
    flushListeners(machine, action, ...payload);
  
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
