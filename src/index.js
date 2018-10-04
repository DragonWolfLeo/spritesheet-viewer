import React from 'react';
import ReactDOM from 'react-dom';
import './CSS/index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker.js';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();