# State in the context of Stent

[Full documentation](./README.md)

---

The state in the context of Stent is represented by a _state object_. The state object is just a normal object literal. The only one required property is `name` and it is used to indicate the state of the machine:

```js
{
  name: 'idle',
  user: {
    firstName: '...',
    lastName: '...'
  },
  someOtherProperty: '...'
}
```

If you try transitioning to a state which is not defined into the `transitions` section or it has no actions in it Stent will throw an exception. It's because once you get into that new state you are basically stuck.

---

[Full documentation](./README.md)