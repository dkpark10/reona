import { rootRender, createRouter, RouteProvider } from '../packages/reona-x/src/core';
import {
  Nested,
  Array,
  Condition,
  Counter,
  Refs,
  Store,
  ContextApp,
} from './reona-x/src';

import Home from './reona-x/src/router-fixture';
import About from './reona-x/src/router-fixture/about';
import Post from './reona-x/src/router-fixture/post';

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
  },
]);

// rootRender(document.getElementById('root')!, ContextApp);
rootRender(document.getElementById('root')!, RouteProvider(router));
