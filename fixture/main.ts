import { rootRender, createRouter, RouteProvider, state, html } from '../packages/reona-x/src/core';
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
import Article from './reona-x/src/router-fixture/article';

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
      beforeEnter: () => {

      },
    }],
  },
]);

function Component() {
  const data = state({
    arr: [0, 1, 2, 3, 4],
  });

  const deleteItem = (id: number) => {
    data.arr = data.arr.filter((item) => item !== id);
  };

  return html`
    <div id="app">
      <ul>
        ${data.arr.map((item) => html`
          <li key=${item}>
            <div class="value">${item}</div>
            <button data-testid="btn-${item}" type="button" @click=${() => deleteItem(item)}></button>
          </li>
        `)}
      </ul>
    </div>`;
};

rootRender(document.getElementById('root')!, Component);
