import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest';
import { html, rootRender, type Router } from '../core';
import {
  createRouter,
  RouteProvider,
  useParams,
  useQueryString,
  Link,
} from '../experimental/router';
import { flushRaf } from './utils';

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  if (document.getElementById('root')) {
    document.body.removeChild(document.getElementById('root')!);
  }
});

function rootRenderImpl(router: Router) {
  const Provider = RouteProvider(router);
  (Provider as any).rootElement = document.getElementById('root');
  rootRender(document.getElementById('root')!, Provider);
}

describe('라우터 테스트', () => {
  test('기본 라우트 매칭을 테스트한다.', async () => {
    function Home() {
      return html`
        <div id="home">
          <h1>Home</h1>
          ${Link(html`<div>about</div>`, { href: '/about' })}
        </div>
      `;
    }

    function About() {
      return html`
        <div id="about">
          <h1>About</h1>
          ${Link(html`<div>home</div>`, { href: '/' })}
        </div>
      `;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    rootRenderImpl(router);

    expect(document.getElementById('home')).toBeInTheDocument();

    document.querySelector('a')?.click();
    await flushRaf();
    expect(document.getElementById('about')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/about');

    document.querySelector('a')?.click();
    await flushRaf();
    expect(document.getElementById('home')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  test('중첩 라우트를 매칭한다.', async () => {
    let capturedParams: Record<string, string> = {};
    function Post() {
      return html`
        <div id="post">${Link(html`<div>dynamic post</div>`, { href: '/post/456' })}</div>
      `;
    }

    function Article() {
      capturedParams = useParams();
      return html`<div id="article">${capturedParams.id}</div>`;
    }

    const router = createRouter([
      {
        path: '/post',
        component: Post,
        children: [{ path: '/:id', component: Article }],
      },
    ]);
    // /post 매칭
    window.history.replaceState(null, '', '/post');
    rootRenderImpl(router);

    expect(document.getElementById('post')).toBeInTheDocument();

    document.querySelector('a')?.click();
    await flushRaf();
    expect(document.getElementById('article')).toBeInTheDocument();
    expect(capturedParams).toEqual({ id: '456' });
  });

  test('복수의 동적 파라미터를 추출한다.', () => {
    let capturedParams: Record<string, string> = {};

    function Article() {
      capturedParams = useParams();
      return html`<div id="article">${capturedParams.category} - ${capturedParams.id}</div>`;
    }

    const router = createRouter([{ path: '/post/:category/:id', component: Article }]);

    window.history.replaceState(null, '', '/post/tech/999');
    rootRenderImpl(router);

    expect(capturedParams).toEqual({ category: 'tech', id: '999' });
  });

  test('쿼리스트링을 추출한다.', () => {
    let capturedQuery: Record<string, string> = {};

    function Search() {
      capturedQuery = useQueryString();
      return html`<div id="search">Search: ${capturedQuery.q}</div>`;
    }

    const router = createRouter([{ path: '/search', component: Search }]);

    window.history.replaceState(null, '', '/search?q=hello&page=1');
    rootRenderImpl(router);

    expect(capturedQuery).toEqual({ q: 'hello', page: '1' });
  });

  test('beforeEach 가드가 동작한다.', async () => {
    const guardFn = vi.fn(() => true);

    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function About() {
      return html`<div id="about">About</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);

    router.beforeEach(guardFn);

    rootRenderImpl(router);

    await router.push('/about');

    expect(guardFn).toHaveBeenCalledWith('/about', '/');
  });

  test('beforeEach에서 false 반환 시 네비게이션이 취소된다.', async () => {
    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/admin', component: Admin },
    ]);

    router.beforeEach((to) => {
      if (to === '/admin') return false;
      return true;
    });

    rootRenderImpl(router);

    await router.push('/admin');

    // 네비게이션 취소되어 Home 유지
    expect(window.location.pathname).toBe('/');
  });

  test('beforeEach에서 리다이렉트한다.', async () => {
    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Login() {
      return html`<div id="login">Login</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/login', component: Login },
      { path: '/admin', component: Admin },
    ]);

    router.beforeEach((to) => {
      if (to === '/admin') return '/login';
      return true;
    });

    rootRenderImpl(router);

    await router.push('/admin');

    expect(window.location.pathname).toBe('/login');
  });

  test('404 페이지를 표시한다.', () => {
    function Home() {
      return html`<div id="home">Home</div>`;
    }

    const router = createRouter([{ path: '/', component: Home }]);

    window.history.replaceState(null, '', '/nonexistent');

    rootRenderImpl(router);

    expect(document.getElementById('root')?.textContent).toBe('404');
  });

  test('getCurrentPath가 현재 경로를 반환한다.', () => {
    function Home() {
      return html`<div>Home</div>`;
    }

    const router = createRouter([{ path: '/', component: Home }]);

    window.history.replaceState(null, '', '/test/path');

    expect(router.getCurrentPath()).toBe('/test/path');
  });

  test('onRouteChange 리스너가 호출된다.', async () => {
    const listenerFn = vi.fn();

    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function About() {
      return html`<div id="about">About</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);

    router.onRouteChange(listenerFn);
    rootRenderImpl(router);

    await router.push('/about');

    expect(listenerFn).toHaveBeenCalledWith('/about');
  });

  test('beforeEnter 가드가 동작한다.', async () => {
    const beforeEnterFn = vi.fn(() => true);

    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/admin', component: Admin, beforeEnter: beforeEnterFn },
    ]);

    rootRenderImpl(router);

    await router.push('/admin');

    expect(beforeEnterFn).toHaveBeenCalledWith('/admin', '/');
    expect(document.getElementById('admin')).toBeInTheDocument();
  });

  test('beforeEnter에서 false 반환 시 네비게이션이 취소된다.', async () => {
    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/admin', component: Admin, beforeEnter: () => false },
    ]);

    rootRenderImpl(router);

    await router.push('/admin');

    expect(window.location.pathname).toBe('/');
    expect(document.getElementById('home')).toBeInTheDocument();
  });

  test('beforeEnter에서 리다이렉트한다.', async () => {
    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Login() {
      return html`<div id="login">Login</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/login', component: Login },
      { path: '/admin', component: Admin, beforeEnter: () => '/login' },
    ]);

    rootRenderImpl(router);

    await router.push('/admin');

    expect(window.location.pathname).toBe('/login');
    expect(document.getElementById('login')).toBeInTheDocument();
  });

  test('beforeEach와 beforeEnter가 순서대로 실행된다.', async () => {
    const beforeEach = vi.fn(() => true);
    const beforeEnterFn = vi.fn(() => true);

    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      {
        path: '/admin',
        component: Admin,
        beforeEnter: beforeEnterFn,
      },
    ]);

    router.beforeEach(beforeEach);

    rootRenderImpl(router);

    await router.push('/admin');
    expect(beforeEach).toHaveBeenCalled();
    expect(beforeEnterFn).toHaveBeenCalled();
  });

  test('beforeEach에서 취소되면 beforeEnter는 실행되지 않는다.', async () => {
    const beforeEnterFn = vi.fn(() => true);

    function Home() {
      return html`<div id="home">Home</div>`;
    }

    function Admin() {
      return html`<div id="admin">Admin</div>`;
    }

    const router = createRouter([
      { path: '/', component: Home },
      { path: '/admin', component: Admin, beforeEnter: beforeEnterFn },
    ]);

    router.beforeEach(() => false);

    rootRenderImpl(router);

    await router.push('/admin');

    expect(beforeEnterFn).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/');
  });

  test('중첩 라우트의 beforeEnter가 동작한다.', async () => {
    const beforeEnterFn = vi.fn(() => true);

    function Post() {
      return html`<div id="post">Post</div>`;
    }

    function Article() {
      return html`<div id="article">Article</div>`;
    }

    const router = createRouter([
      {
        path: '/post',
        component: Post,
        children: [{ path: '/:id', component: Article, beforeEnter: beforeEnterFn }],
      },
    ]);

    window.history.replaceState(null, '', '/');
    rootRenderImpl(router);

    await router.push('/post/123');

    expect(beforeEnterFn).toHaveBeenCalledWith('/post/123', '/');
    expect(document.getElementById('article')).toBeInTheDocument();
  });
});
