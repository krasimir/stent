## 3.2.1

Fixing a critical bug introduced by 3.2.0 (do not use it).

## 3.2.0

Adding machine `destroy` method.

## 3.1.2

Tooling for the devtools.

## 3.1.1

Adding new middleware hooks. (`onMachineCreated`, `onMachineConnected`, `onMachineDisconnected`)

## 3.0.1

Adding devtools window global key access.

## 3.0.0

* Adding `machine.<method>.latest` alias so we cover the `takeLatest` saga method
* Changing the way of how the middlewares work. They now don't block the Stent's logic. No `next` method anymore. [Middlewares](./docs/middlewares.md)
* Documentation is restructured

## 2.0.0

Killing the `wait` generator helper. It is an anti-pattern. We shouldn't listen for actions like that. If there is such a need we better create a dedicated state for it.
Also some clean up.

## 1.1.5

Updating README + adding npm ignore file.

## 1.1.4

Making sure that the js context is kept while running generators.

## 1.1.3

Do not create a new error if a promise in a `call` gets rejected.

## 1.1.2

Just a README update.

## 1.1.1

Stop trying to print object in the Logger middleware.

## 1.1.0

Adding `onGeneratorStep` to the middleware's hook.

## 1.0.0

* Adding `Logger` middleware
* When adding a middleware the hook `onStateChange` is now called `onStateChanged` 

## 0.7.3

Making sure that the mapping callback is fired only when the connected machine is updated.

## 0.7.2

README changes.

## 0.7.1

Fancy logo.

## 0.7.0

NOT throwing an error if the dispatched action is missing in the current state.

## 0.6.0

Short syntax for creating a machine.

## 0.5.0

Support of no mapping function in the `connect` helper + support of `mapSilent` for the React's version of connect.

## 0.4.0

Support of `wait(actionA, actionB)` on top of `wait([actionA, actionB])`

## Before 0.4.0

Wild Wild West ...