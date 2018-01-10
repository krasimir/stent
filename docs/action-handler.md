# Action handler 

[Full documentation](./README.md)

---

The action handler may be just a string. In the following example `fetching` is the same as `{ name: 'fetching' }` state object.

```js
Machine.create('app', {
  'idle': {
    'fetch data': 'fetching'
  }
});
```

Could be also a state object:

```js
Machine.create('app', {
  'idle': {
    'fetch data': { name: 'fetching', data: [], pending: false }
  }
});
```

Another variant is to use a function that returns a string. Which again results in `{ name: 'fetching' }`.

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      return 'fetching';
    }
  }
});
```

Notice that the function receives the current state and some payload passed when the action is fired.

And of course we may return the actual state object. That's actually a common case because very often we want to keep some data alongside: 

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      return { name: 'fetching', answer: 42 };
    }
  }
});
```

The context of the action handler function (or generator) is the machine itself. This means that `this` inside the function points to the created machine and we may call its methods. For example:

```js
Machine.create('app', {
  'idle': {
    'fetch data': function (state, payload) {
      if (this.isIdle()) {
        this.request('/api/todos');
      }
    },
    'request': function (state, endpoint) {
      console.log(endpoint); // endpoint = /api/todos
    }
  }
});
```

In some cases you don't want to change the state but only handle the action. So feel free to skip the `return` statement. If the handler returns `undefined` the machine keeps its state.

We may also use a generator if we have more complex operations or/and async tasks.

```js
Machine.create('app', {
  'idle': {
    'fetch data': function * (state, payload) {
      yield 'fetching'; // transition to a `fetching` state
      yield { name: 'fetching' } // the same but using a state object
    }
  }
});
```

What we can `yield` is a state object (or a string that represents a state) or a call to some of the predefined Stent helpers like `call`. This is the place where Stent looks a bit like [redux-saga](https://redux-saga.js.org/) library. The code above is an equivalent of the `take` side effect helper. There is also a `takeLatest` equivalent. It is just the same action method but with `.latest` at the end. For example if you have `machine.fetchData()` for `take`, `machine.fetchData.latest()` stands for `takeLatest`. If you are not familiar with redux-saga just imagine that you have an async logic and you handle it via a generator. The `.latest` helps when you run this logic many times in row but you want to handle only the last call.

### Helpers to handle async logic

*`yield call(<function>, ...args)`*

`call` is blocking the generator function and calls `<function>` with the given `...args`. `<function>` could be:

* A synchronous function
* A function that returns a promise
* Another generator function

```js
import { call } from 'stent/lib/helpers';

Machine.create('app', {
  'idle': {
    'fetch data': function * () {
      const data = yield call(requestToBackend, '/api/todos/', 'POST');
    }
  }
});
```

*`requestToBackend` is getting called with `/api/todos/` and `POST` as arguments.*

Keep in mind that if you are using the `latest` version of your method you are able to cancel the previously fired generator only if you use the `call` helper. That's because in this case you are giving the control to Stent and the library is able to stop/cancel stuff. Otherwise you have to handle such cases on your own. To get a better context for the problem check out this [issue](https://github.com/krasimir/stent/issues/3).

---

[Full documentation](./README.md)
