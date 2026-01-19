import { html, createComponent } from '../core';
import type { Component, Props } from '../utils/types';
import { contextProvider } from '../core/context';

export interface RouteOption {
  path: string | RegExp;
  component: Component;
  props?: Props;
}

export interface Router {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
  getCurrentPath: () => string;
  getComponent: () => Component | null;
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

  const getComponent = function (): Component | null {
    const currentPath = getCurrentPath();
    const route = findRoute(currentPath);
    return route?.component ?? null;
  };

  const push = function (path: string) {
    window.history.pushState(null, '', path);
    notifyListeners();
  };

  const replace = function (path: string) {
    window.history.replaceState(null, '', path);
    notifyListeners();
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

  window.addEventListener('popstate', notifyListeners);

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

export function useRouter() {
}

export function EnrollRouter(router: Router) {
  contextProvider.setContext(router, router);
  return router.getComponent();
}

type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

type AnchorWithHref =
  RequireKeys<Partial<HTMLAnchorElement>, "href">;

export function Link(attr: AnchorWithHref, children: Component) {
  const router = useRouter() as unknown as Router;

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    router.push(attr.href);
  };

  return html`
    <a href="${attr.href}" @click=${onClick}>
      ${createComponent(children)}
    </a>
  `;
}