import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

// Import Components
import App from './components/App';
import Single from './components/Single';
import PhotoGrid from './components/PhotoGrid';

export default history =>
(
<Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={PhotoGrid}></IndexRoute>
        <Route path="/view/:postId" component={Single}></Route>
      </Route>
</Router>
);