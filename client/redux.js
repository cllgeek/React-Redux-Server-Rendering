import 'babel-polyfill';
import React from 'react';

import { render } from 'react-dom';

// Import css
import css from './styles/style.styl';


// import react router deps
import { Provider } from 'react-redux';
import configureStore from './store';
import createRouter from './routes'

const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

const router = (
  <Provider store={store}>
    {createRouter()}
  </Provider>
)

render(router, document.getElementById('root'));
