import React from 'react';
import { render } from 'react-dom';
import { Machine } from 'stent';
import ToDos from './machines/ToDos.js';
import App from './components/App';
import './index.css';

Machine.create('ToDos', ToDos);

render(<App />, document.getElementById('root'));
