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

interface Router {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  getCurrentPath: () => string;
  getComponent: () => { component: Component, props: RouteOption['props'] };
  onRouteChange: (callback: (path: string) => void) => () => void;
}

export function createRouter(routes: RouteOption[]): Router {
  const listeners = new Set<(path: string) => void>();

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

  const getCurrentPath = function () {
    return window.location.pathname;
  };

  const getComponent = function () {
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

  const push = function (path: string) {
    window.history.pushState(null, '', path);
    renderRoute();
  };

  const replace = function (path: string) {
    window.history.replaceState(null, '', path);
    renderRoute();
  };

  const back = function () {
    window.history.back();
  };

  const forward = function () {
    window.history.forward();
  };

  const onRouteChange = function (callback: (path: string) => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  };

  window.addEventListener('popstate', renderRoute);

  return {
    push,
    replace,
    back,
    forward,
    getCurrentPath,
    getComponent,
    onRouteChange,
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
