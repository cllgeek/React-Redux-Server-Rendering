import { createStore, compose } from 'redux';
import { syncHistoryWithStore} from 'react-router-redux';
import { browserHistory } from 'react-router';

// import the root reducer
import rootReducer from './reducers/index';

export default function configureStore(preloadedState){
    const store = createStore(rootReducer, preloadedState);

    if(module.hot) {
    module.hot.accept('./reducers/',() => {
    const nextRootReducer = require('./reducers/index').default;
    store.replaceReducer(nextRootReducer);
  });
 }

    return store;
}

