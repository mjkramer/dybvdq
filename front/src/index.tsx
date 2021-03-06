import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Action, applyMiddleware, createStore, Reducer } from 'redux';
import reduxCookiesMiddleware from 'redux-cookies-middleware';
import thunk from 'redux-thunk';

import App from './components/App';
import { AppState, cookiePaths } from './model';
import reducer from './reducer';

// FIXME: reducer is inferred as Reducer<AppState, any>
export const store = createStore(
  reducer as Reducer<AppState, Action<any>>,
  applyMiddleware(thunk, reduxCookiesMiddleware(cookiePaths)),
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
