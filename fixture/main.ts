import { rootRender, createRouter, RouteProvider, state, html } from '../packages/reona/src/core';
import {
  Nested,
  Array,
  Condition,
  Counter,
  Refs,
  Store,
  ContextApp,
} from './reona/src';

import Home from './reona/src/router-fixture';
import About from './reona/src/router-fixture/about';
import Post from './reona/src/router-fixture/post';
import Article from './reona/src/router-fixture/article';

const router = createRouter([
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: About,
  },
  {
    path: '/post',
    component: Post,
    children: [{
      path: '/:postId',
      component: Article,
      beforeEnter: (to, from) => {
        to; from;
        return true;
      },
    }],
  },
]);

rootRender(document.getElementById('root')!, RouteProvider(router));
