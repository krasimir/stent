# `connect` and `disconnect` 

[Full documentation](./README.md)

---

`connect` is the short way to do `Machine.get` and retrieving one or more created machines. It also provides a mechanism for subscribing for machine's state changes.

```js
import { connect } from 'stent/lib/helpers';

Machine.create('MachineA', ...);
Machine.create('MachineB', ...);

connect()
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    // called once by default and then
    // multiple times when the state of
    // MachineA or MachineB changes
  });
```

The mapping function by default is called once initially and then every time when the state of the connected machines changes. So, if you need only that first call use `mapOnce` instead.

```js
connect()
  .with('MachineA', 'MachineB')
  .mapOnce((MachineA, MachineB) => {
    // this gets called only once
  });
```

If you want to use `map` but skip the initial call of your mapping function then use `mapSilent`:

```js
connect()
  .with('MachineA', 'MachineB')
  .mapSilent((MachineA, MachineB) => {
    // called multiple times when the state of
    // MachineA or MachineB changes
  });
```

You may also need to `disconnect` which makes sense if you use the `map` function. If you are connecting with `mapOnce` your mapping function is getting called only once anyway.

```js
const disconnect = connect()
  .with('MachineA', 'MachineB')
  .map((MachineA, MachineB) => {
    // called multiple times
  });

// at some point later
disconnect();
```

_If you are looking for connecting to a React component follow [this link](./react-integration.md)._

---

[Full documentation](./README.md)