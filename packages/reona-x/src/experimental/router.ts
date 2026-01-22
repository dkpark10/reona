import { html, createComponent, context } from '../core';
import type { Component, Props, RenderResult } from '../utils/types';
import { createContext } from '../core';
import { isRenderResultObject } from '../utils';
import type ComponentInstance from '../core/component-instance';

let rootElement: HTMLElement | null = null;
let currentMatchedInstance: ComponentInstance | null = null;

type GuardResult = boolean | string | void;
type BeforeGuard = (to: string, from: string) => GuardResult | Promise<GuardResult>;
type Params = Record<string, string>;

interface RouteOption {
  path: string | RegExp;
  component: Component;
  props?: Props;
  beforeEnter?: BeforeGuard;
  children?: RouteOption[];
}

interface MatchResult {
  route: RouteOption;
  params: Params;
  fullPath: string;
}

export interface Router {
  push: (path: string) => Promise<void>;
  replace: (path: string) => Promise<void>;
  back: () => void;
  forward: () => void;
  getCurrentPath: () => string;
  getParams: () => Params;
  getComponent: () => { component: Component; props: Props };
  onRouteChange: (callback: (path: string) => void) => () => void;
  beforeEach: (guard: BeforeGuard) => () => void;
}

export function createRouter(routes: RouteOption[]): Router {
  const listeners = new Set<(path: string) => void>();
  const beforeGuardsFn: BeforeGuard[] = [];

  // 경로 매칭 및 params 추출
  const matchPath = function (routePath: string | RegExp, targetPath: string): Params | null {
    if (routePath instanceof RegExp) {
      const match = targetPath.match(routePath);
      return match ? {} : null;
    }

    // param 이름 추출: /post/:id/:slug → ['id', 'slug']
    const paramNames: string[] = [];
    const pattern = routePath.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${pattern}$`);
    const match = targetPath.match(regex);

    if (!match) return null;

    // params 객체 생성: { id: '123', slug: 'hello' }
    const params: Params = {};
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });

    return params;
  };

  const findRoute = function (
    path: string,
    routeList: RouteOption[] = routes,
    basePath: string = ''
  ): MatchResult | undefined {
    for (const route of routeList) {
      const fullPath = basePath + route.path;

      const params = matchPath(fullPath, path);
      if (params !== null) {
        return { route, params, fullPath };
      }

      if (route.children && route.children.length > 0) {
        const childMatch = findRoute(path, route.children, fullPath);
        if (childMatch) {
          return childMatch;
        }
      }
    }

    return undefined;
  };

  const notifyListeners = function () {
    const currentPath = getCurrentPath();
    listeners.forEach((fn) => fn(currentPath));
  };

  const getCurrentPath = function (): string {
    return window.location.pathname;
  };

  const getComponent = function (): { component: Component; props: Props } {
    const currentPath = getCurrentPath();
    const match = findRoute(currentPath);

    if (!match) {
      return {
        component: () => html`404`,
        props: {},
      };
    }

    return {
      component: match.route.component,
      props: {
        ...match.route.props,
      },
    };
  };

  const renderRoute = function () {
    currentMatchedInstance?.hookHandler.unmountAll(
      currentMatchedInstance.prevVnodeTree,
      currentMatchedInstance
    );

    const root = rootElement;
    if (root) {
      const { component, props } = getComponent();
      root.replaceChildren();

      const getInstance = createComponent(component, { props });
      const instance = getInstance(0);
      instance.render(root);
      currentMatchedInstance = instance;
    }

    notifyListeners();
  };

  const runGuards = async function (to: string, from: string): Promise<GuardResult> {
    // 1. beforeEach (전역 가드) 실행
    for (const guard of beforeGuardsFn) {
      const result = await guard(to, from);
      if (result === false) {
        return false;
      }
      if (typeof result === 'string') return result;
    }

    // 2. beforeEnter (라우트별 가드) 실행
    const match = findRoute(to);
    if (match?.route.beforeEnter) {
      const result = await match.route.beforeEnter(to, from);
      if (result === false) {
        return false;
      }
      if (typeof result === 'string') return result;
    }
    return true;
  };

  const push = async function (path: string) {
    const from = getCurrentPath();
    const result = await runGuards(path, from);

    if (result === false) return;
    if (typeof result === 'string') {
      await push(result);
      return;
    }

    window.history.pushState(null, '', path);
    renderRoute();
  };

  const replace = async function (path: string) {
    const from = getCurrentPath();
    const result = await runGuards(path, from);

    if (result === false) {
      return;
    }

    if (typeof result === 'string') {
      await replace(result);
      return;
    }

    window.history.replaceState(null, '', path);
    renderRoute();
  };

  const back = function () {
    window.history.back();
  };

  const forward = function () {
    window.history.forward();
  };

  const getParams = function (): Params {
    const currentPath = getCurrentPath();
    const match = findRoute(currentPath);
    return match?.params ?? {};
  };

  const onRouteChange = function (fn: (path: string) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };

  const beforeEach = function (guard: BeforeGuard) {
    beforeGuardsFn.push(guard);
    return function unsubscribe() {
      const index = beforeGuardsFn.indexOf(guard);
      if (index > -1) {
        beforeGuardsFn.splice(index, 1);
      }
    };
  };

  // popstate 가드처리
  const handlePopstate = async function () {
    const to = getCurrentPath();
    // popstate는 이미 url 변경된 상태이므로 가드 실패 시 원위치
    const from = to;
    const result = await runGuards(to, from);

    if (result === false) {
      window.history.forward();
      return;
    }

    if (typeof result === 'string') {
      window.history.replaceState(null, '', result);
    }
    renderRoute();
  };

  window.addEventListener('popstate', handlePopstate);

  return {
    push,
    replace,
    back,
    forward,
    getCurrentPath,
    getParams,
    getComponent,
    onRouteChange,
    beforeEach,
  };
}

const routerContext = createContext<null | Router>(null);

export function useRouter() {
  const router = context(routerContext);
  if (!router) {
    throw new Error('useRouter RouteProvider 내부에서 사용해야 합니다.');
  }
  return router;
}

export function useParams(): Params {
  const router = context(routerContext);
  if (!router) {
    throw new Error('useParams는 RouteProvider 내부에서 사용해야 합니다.');
  }
  return router.getParams();
}

export function useQueryString(): Params {
  const searchParams = new URLSearchParams(window.location.search);
  const query: Params = {};

  for (const [key, value] of searchParams) {
    query[key] = value;
  }

  return query;
}

export function RouteProvider(router: Router) {
  return function RouteProviderImpl() {
    rootElement = (RouteProviderImpl as any).rootElement;
    currentMatchedInstance = (RouteProviderImpl as any).currentMatchedInstance;
    const targetComponent = router.getComponent();

    return routerContext.provider({
      value: router,
      children: targetComponent.component,
    });
  };
}

type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

type AnchorWithHref = RequireKeys<Partial<HTMLAnchorElement>, 'href'>;

interface LinkComponentProps {
  children: Component | RenderResult;
  attr: AnchorWithHref;
}
function LinkComponent({ children, attr }: LinkComponentProps) {
  const router = useRouter();
  if (!router) {
    throw new Error('RouteProvider를 선언해야 합니다.');
  }

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    router.push(attr.href);
  };

  return html`
    <a href="${attr.href}" @click=${onClick}>
      ${isRenderResultObject(children) ? children : createComponent(children)}
    </a>
  `;
}

export function Link(children: Component | RenderResult, attr: AnchorWithHref) {
  return createComponent(LinkComponent, {
    props: {
      children,
      attr,
    },
  });
}
