# reona

react 기반 인터페이스 UI 라이브러리

## 전체 구성도

![architecture](/architecture.png)

## 사용법

### 상태 변이
```javascript
import { html, state, rootRender } from 'reona';

export default function App() {
  const data = state({
    count: 0,
  });

  const onClick = () => {
    data.count += 1;
  }

  return html`
    <div id="app">
      <button type="button" @click=${onClick}>click</button>
      <div>
        <span>${data.count}</span>
      </div>
    </div>
  `;
}

rootRender(document.getElementById('root')!, App);
```

### 라이프 사이클 mount, unmount, updated
```javascript
import { mount } from 'reona';

export default function App() {
  const data = state({
    count: 0,
  });

  mount(() => {
    console.log('mount');
    return () => {
      console.log('cleanup');
    }
  });

  updated(data, () => {
    console.log('data가 변경될 때 실행');
  });

  return html`
    <div id="app">
    </div>
  `;
}

rootRender(document.getElementById('root')!, App);
```

### props 관찰
```javascript
import { watchProps, createComponent } from 'reona';

export default function App() {
  const data = state({
    count: 0,
  });

  const onClick = () => {
    data.count += 1;
  };

  return html`
    <div id="app">
      <button type="button" @click=${onClick}>트리거</button>
      ${createComponent(Son, {
        props: {
          value: data.count * 2,
        },
      })}
    </div>
  `;
}

function Son({ value }) {
  watchProps((prev) => {
    console.log(prev); // 0
  });

  return html`
    <div>
      ${value}
    </div>
  `;
  

rootRender(document.getElementById('root')!, App);
```

### 전역 스토어
```javascript
import { createStore, store } from 'reona';

const countStore = createStore({
  count: 10000,
});

function Store() {
  return html`
    <div id="app">
      ${createComponent(Child1)}
      ${createComponent(Child2)}
    </div>`;
}

function Child1() {
  const storeData = store(countStore);
  const trigger = () => {
    storeData.count += 1;
  };

  return html`
    <div>
      <button type="button" @click=${trigger}>trigger</button>
      <div id="store1">${storeData.count}</div>
    </div>
  `;
}

function Child2() {
  const storeData = store(countStore);
  return html` <div id="store2">${storeData.count}</div> `;
}

rootRender(document.getElementById('root')!, Store);
```

### 캐싱기능
```javascript
function App() {
  const data = state({ count: 1 });

  const doubled = memo(data, () => data.count * 2);

  const noop = () => {
    data.count += 1;
  };

  return html`
    <div id="app">
      <button type="button" @click=${noop}>noop</button>
      <div data-testid="result">${doubled}</div>
    </div>`;
}

rotRender(document.getElementById('root')!, App);
```

### ref
```javascript
function RefElement() {
  const headingElement = ref<HTMLHeadElement | null>(null);

  mounted(() => {
    console.log(headingElement.current); // headingElement
  });

  return html`
    <div id="app">
      <h1 $$ref="${setRef(headingElement)}">hh</h1>
    </div>
  `;
}

rootRender(document.getElementById('root')!, RefElement);
```

### 라우트
```javascript
import { 
  rootRender,
  createRouter,
  RouteProvider,
  Link,
  html,
  useParams,
  useQueryString 
} from 'reona';

function Home() {
  return html`
    <div id="app">
      <div>home</div>
      ${Link(html`<div>about</div>`, { href: '/about' })}
      ${Link(html`<div>post</div>`, { href: '/post' })}
    </div>
  `;
}

function About() {
  return html`
    <div id="app">
      <div>about</div>
      ${Link(html`<div>post</div>`, { href: '/post' })}
      ${Link(html`<div>home</div>`, { href: '/' })}
    </div>
  `;
}

function Post() {
  return html`
    <div id="app">
      <div>post</div>
      ${Link(html`<div>home</div>`, { href: '/' })}
      ${Link(html`<div>about</div>`, { href: '/about' })}
    </div>
  `;
}

function Article() {
  const params = useParams();
  const qs = useQueryString();

  return html`
    <article>
      article ${params.postId}
    </article>
  `;
}

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
```