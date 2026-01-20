import { html, createComponent, context } from '../core';
import type { Component, Props, RenderResult } from '../utils/types';
import { createContext } from '../core';
import { isRenderResultObject } from '../utils';
import type ComponentInstance from '../core/component-instance';

let rootElement: HTMLElement | null = null;
let currentMatchedInstance: ComponentInstance | null = null;

interface RouteOption {
  path: string | RegExp;
  component: Component;
  props?: Props;
}

type GuardResult = boolean | string | void;

type BeforeGuard = (to: string, from: string) => GuardResult | Promise<GuardResult>;

interface Router {
  push: (path: string) => Promise<void>;
  replace: (path: string) => Promise<void>;
  back: () => void;
  forward: () => void;
  getCurrentPath: () => string;
  getComponent: () => { component: Component, props: RouteOption['props'] };
  onRouteChange: (callback: (path: string) => void) => () => void;
  beforeEach: (guard: BeforeGuard) => () => void;
}

export function createRouter(routes: RouteOption[]): Router {
  const listeners = new Set<(path: string) => void>();
  const beforeGuardsFn: BeforeGuard[] = [];

  const findRoute = function (path: string): RouteOption | undefined {
    return routes.find((route) => {
      if (typeof route.path === 'string') {
        return route.path === path
      }
      return route.path.test(path);
    });
  };

  const notifyListeners = function () {
    const currentPath = getCurrentPath();
    listeners.forEach((fn) => fn(currentPath));
  };

  const getCurrentPath = function (): string {
    return window.location.pathname;
  };

  const getComponent = function (): { component: Component, props: RouteOption['props'] } {
    const currentPath = getCurrentPath();
    const route = findRoute(currentPath);
    return {
      component: route?.component ?? (() => html``),
      props: route?.props,
    }
  };

  const renderRoute = function () {
    currentMatchedInstance?.unmountAll();

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
    for (const guard of beforeGuardsFn) {
      const result = await guard(to, from);
      if (!result) {
        return false;
      }
      if (typeof result === 'string') {
        return result;
      }
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
    getComponent,
    onRouteChange,
    beforeEach,
  };
}

const routerContext = createContext<null | Router>(null);

export function useRouter() {
  const router = context(routerContext);
  return router;
}

export function RouteProvider(router: Router) {
  return function RouteProviderImpl () {
    rootElement = (RouteProviderImpl as any).rootElement;
    currentMatchedInstance = (RouteProviderImpl as any).currentMatchedInstance;
    const targetComponent = router.getComponent();

    return routerContext.provider({
      value: router,
      children: targetComponent.component,
    });
  }
}

type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

type AnchorWithHref =
  RequireKeys<Partial<HTMLAnchorElement>, "href">;

interface LinkComponentProps {
  children: Component | RenderResult;
  attr: AnchorWithHref
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
    }
  });
}
