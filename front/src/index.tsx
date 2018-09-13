import 'bootstrap/dist/css/bootstrap.min.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Action, applyMiddleware, createStore, Reducer } from 'redux';
import thunk /*, { ThunkDispatch }*/ from 'redux-thunk';

import App from './components/App';
import { AppState } from './model';
import reducer from './reducer';
// import { initLocation } from './thunks';

// FIXME: reducer is inferred as Reducer<AppState, any>
export const store = createStore(
  reducer as Reducer<AppState, Action<any>>,
  applyMiddleware(thunk),
);

// (store.dispatch as ThunkDispatch<AppState, void, Action>)(initLocation(21221, 1, 'EH1'));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
