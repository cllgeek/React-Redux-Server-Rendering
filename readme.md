## React 服务器端渲染

This project  start building an isomorphic rendering application in React and Redux.

## 技术栈

- React.js
- React-router
- Webpack
- Express
- Redux
- Babel
- styl

## 起步
本项目启动前默认你已经安装[node](http://nodejs.cn/)（建议安装6.0+版本）:smirk:

#### 克隆项目
    git clone https://github.com/cllgeek/React-Redux-Server-Rendering.git

#### 进入目录
    cd React-Redux-Server-Rendering

#### 安装依赖
    npm install(建议安装淘宝的cnpm 然后执行cnpm i)

#### 启动开发模式（运行 npm start，即可将项目打包）
    npm start

#### 启动就绪后，打开浏览器，输入 http://localhost:7770/ ，点击浏览器右键查看源代码,发现页面不再是一个js链接,而是经过服务器端渲染:smile:

#### 原理
React 提供了两个方法 renderToString 和 renderToStaticMarkup 用来将组件（Virtual DOM）输出成 HTML 字符串，这是 React 服务器端渲染的基础，它移除了服务器端对于浏览器环境的依赖，所以让服务器端渲染变成了一件有吸引力的事情。

服务器端渲染除了要解决对浏览器环境的依赖，还要解决两个问题：

* 前后端可以共享代码
* 前后端路由可以统一处理

这里先来介绍Redux和react-router(更多资源可以查看我搜集的[react-tutorial](https://github.com/cllgeek/react-tutorial))

#### 2 分钟了解 Redux 是如何运作的
关于 Store：

- 整个应用只有一个唯一的 Store
- Store 对应的状态树（State），由调用一个 reducer 函数（root reducer）生成
- 状态树上的每个字段都可以进一步由不同的 reducer 函数生成
- Store 包含了几个方法比如 dispatch, getState 来处理数据流
- Store 的状态树只能由 dispatch(action) 来触发更改

Redux 的数据流：

- action 是一个包含 { type, payload } 的对象
- reducer 函数通过 store.dispatch(action) 触发
- reducer 函数接受 (state, action) 两个参数，返回一个新的 state
- reducer 函数判断 action.type 然后处理对应的 action.payload 数据来更新状态树

所以对于整个应用来说，一个 Store 就对应一个 UI 快照，服务器端渲染就简化成了在服务器端初始化 Store，将 Store 传入应用的根组件，针对根组件调用 renderToString 就将整个应用输出成包含了初始化数据的 HTML。

#### react-router

react-router 通过一种声明式的方式匹配不同路由决定在页面上展示不同的组件，并且通过 props 将路由信息传递给组件使用，所以只要路由变更，props 就会变化，触发组件 re-render。

假设有一个很简单的应用，只有两个页面，一个列表页 /list 和一个详情页 /item/:id，点击列表上的条目进入详情页。

可以这样定义路由，./routes.js
```
import React from 'react';
import { Route } from 'react-router';
import { List, Item } from './components';

// 无状态（stateless）组件，一个简单的容器，react-router 会根据 route
// 规则匹配到的组件作为 `props.children` 传入
const Container = (props) => {
  return (
    <div>{props.children}</div>
  );
};

// route 规则：
// - `/list` 显示 `List` 组件
// - `/item/:id` 显示 `Item` 组件
const routes = (
  <Route path="/" component={Container} >
    <Route path="list" component={List} />
    <Route path="item/:id" component={Item} />
  </Route>
);

export default routes;
```

## Isomorphic JavaScript 同构入门

推荐看[React Redux Sever Rendering（Isomorphic JavaScript）入門](https://github.com/kdchang/reactjs101/blob/master/Ch10/react-redux-server-rendering-isomorphic-javascript.md)
我发现这个写得实在太好了,就没必要自己查资源写了。

## Server Rendering

接下来的服务器端就比较简单了，获取数据可以调用 action，routes 在服务器端的处理参考 react-router server rendering，在服务器端用一个 match 方法将拿到的 request url 匹配到我们之前定义的 routes，解析成和客户端一致的 props 对象传递给组件。

./devServer.js
```
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
```
服务器端渲染部分可以直接通过共用客户端 store.dispatch(action) 来统一获取 Store 数据。另外注意 renderFullPage 生成的页面 HTML 在 React 组件 mount 的部分(<div id="root">)，前后端的 HTML 结构应该是一致的。然后要把 store 的状态树写入一个全局变量（__INITIAL_STATE__），这样客户端初始化 render 的时候能够校验服务器生成的 HTML 结构，并且同步到初始化状态，然后整个页面被客户端接管。

## 更多资源

- [Universal (Isomorphic)](http://isomorphic.net/)
- [isomorphic-redux-app](https://github.com/caljrimmer/isomorphic-redux-app)
- [ReactEcosystemStudy](https://github.com/cllgeek/ReactEcosystemStudy)

## 开发交流
如果你在学习本项目遇到问题，请加群交流： [495489065](http://shang.qq.com/wpa/qunwpa?idkey=4e8ab985822977ef7e4c1a63eec78f4d17b1af27d5d71a85d8599691930b676f) :smile:

# License
MIT