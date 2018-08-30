import 'bootstrap/dist/css/bootstrap.min.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Action, createStore, Reducer } from 'redux';

import App from './components/App';
import { IAppState } from './model';
import reducer from './reducer';

// FIXME: reducer is inferred as Reducer<IAppState, any>
export const store = createStore(reducer as Reducer<IAppState, Action<any>>);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
