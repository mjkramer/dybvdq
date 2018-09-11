import 'bootstrap/dist/css/bootstrap.min.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Action, applyMiddleware, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';

import App from './components/App';
import { AppState } from './model';
import reducer from './reducer';

// FIXME: reducer is inferred as Reducer<AppState, any>
export const store = createStore(
  reducer as Reducer<AppState, Action<any>>,
  applyMiddleware(thunk),
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
