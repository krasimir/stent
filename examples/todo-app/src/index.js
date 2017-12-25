import React from 'react';
import { render } from 'react-dom';
import { Machine } from 'stent';
import { StentEmitter, ReactEmitter } from 'kuker-emitters';
import ToDos from './machines/ToDos.js';
import App from './components/App';
import './index.css';

// window.addEventListener('message', event => {
//   console.log(event.data);
// });

Machine.addMiddleware(StentEmitter());
Machine.create('ToDos', ToDos);

render(<App />, document.getElementById('root'));

// ---------------------------------------------- ReactEmitter

ReactEmitter();
