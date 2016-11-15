var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');

import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import { Provider } from 'react-redux';
import createRouter from './client/routes';
import configureStore from './client/store';

var app = express();
var compiler = webpack(config);

import comments from './client/data/comments';
import posts from './client/data/posts';

// create an object for the default data
const defaultState = {
  posts,
  comments
};

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

function renderFullPage(html, initialState) {
  return `
    <!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>isomorphic-redux-app</title>
    <link rel="shortcut icon" type="image/png" href="http://obl1r1s1x.bkt.clouddn.com/bitbug_favicon.ico"/>

  </head>
  <body>
    <div id="root">${html}</div>
    <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
    </script>
    <script src="/static/bundle.js"></script>
  </body>
</html>
  `;
}

app.use((req, res) => {
 const store = configureStore(defaultState);
 const routes = createRouter();
 const state = store.getState();

  match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
    if (err) {
      res.status(500).end(`Internal Server Error ${err}`);
    } else if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const html = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>
        );
        res.end(renderFullPage(html, store.getState()));
    } else {
      res.status(404).end('Not found');
    }
  });
});

app.listen(7770, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:7770');
});
