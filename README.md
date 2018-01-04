![Stent - brings the power of state machines to the web](./_logo/logo.gif)

Stent is combining the ideas of [Redux](http://redux.js.org/) with the concept of [state machines](https://en.wikipedia.org/wiki/Automata_theory).

![Travis](https://travis-ci.org/krasimir/stent.svg?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/stent.svg?style=flat-square)](https://www.npmjs.com/package/stent)

---

## A few words about state machines

State machine is a mathematical model of computation. It's an abstract concept where the machine may have different states but at a given time fulfills only one of them. It accepts input and based on that (plus its current state) transitions to another state. Isn't it familiar? Yes, it sounds like a front-end application. That's why this model/concept applies nicely to UI development.

*Disclaimer: there are different types of state machines. I think the one that makes sense for front-end development is [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine).*

## Installation

The library is available as a [npm module](https://www.npmjs.com/package/stent) so `npm install stent` or `yarn add stent` will do the job. There's also a standalone version [here](./standalone) (only core functionalities) which you can directly add to your page.

## Documentaion

* [Getting started](./docs/getting-started.md)
* API
  * [`<state object>`](./docs/state-object.md)
  * [`Machine.<api method>`](./docs/machine.md)
  * [`<action-handler>`](./docs/action-handler.md)
  * [`connect` and `disconnect`](./docs/connect-and-disconnect.md)
  * [Middlewares](./docs/middlewares.md)
  * [React integration](./docs/react-integration.md)
* [examples](./docs/examples.md)

## Debugging apps made with Stent

Stent is supported by [Kuker](https://github.com/krasimir/kuker) Chrome extension. Just add the [Stent emitter](https://github.com/krasimir/kuker-emitters#integration-with-stent) to your app and open the [Kuker](https://github.com/krasimir/kuker) tab in Chrome's DevTools.

![Kuker](https://github.com/krasimir/kuker-emitters/raw/master/img/screenshot_stent.jpg)

## Must-read articles/resources

* [You are managing state? Think twice.](http://krasimirtsonev.com/blog/article/managing-state-in-javascript-with-state-machines-stent) - an article explaining why finite state machines are important in the context of the UI development.
* [Getting from Redux to a state machine](http://krasimirtsonev.com/blog/article/getting-from-redux-to-state-machine-with-stent) - a tutorial that transforms a Redux app to an app using Stent
* [Robust React User Interfaces with Finite State Machines](https://css-tricks.com/robust-react-user-interfaces-with-finite-state-machines/)
* [Mealy state machine](https://en.wikipedia.org/wiki/Mealy_machine)

## Other libraries dealing with state machines

* [xstate](https://github.com/davidkpiano/xstate)
* [machina](http://machina-js.org/)
