import React from 'react';
import { render } from 'react-dom';
import { Machine } from 'stent';
import { DevTools } from 'stent/lib/middlewares';
import ToDos from './machines/ToDos.js';
import App from './components/App';
import './index.css';

Machine.create('ToDos', ToDos);
Machine.addMiddleware(DevTools);

render(<App />, document.getElementById('root'));
