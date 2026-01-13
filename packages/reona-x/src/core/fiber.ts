import type { Component, Props, Data } from '../utils/types';
import { getDepth } from '../../../shared';
import Parser, { type VNode } from './parser';
import { createDOM } from './runtime-dom';

/** @description 전역 컴포넌트 관리 map */
let instanceMap: Map<Component, Map<string, Fiber>>;
export function getInstanceMap() {
  return instanceMap;
}

const NOT_PRODUCTION = __DEV__ || __TEST__;

if (NOT_PRODUCTION) {
  instanceMap = new Map<Component, Map<string, Fiber>>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<Component, Map<string, Fiber>>();
}

let currentFiber: Fiber | null = null;
export function getCurrentFiber() {
  return currentFiber;
}

export const mountHooks = new WeakMap<Fiber, Set<() => void>>();
export const unMountHooks = new WeakMap<Fiber, Set<() => void>>();
export const updatedHooks = new WeakMap<Fiber, Set<<D extends Data>(next: D, prev: D) => void>>();

type FiberOption = {
  key: string;
};

export default class Fiber {
  private parentElement: Element;

  private component: Component;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  private prevDom: HTMLElement;

  private nextDom: HTMLElement;

  public isMounted = false;

  public key: string;

  public props?: Props;

  public nextState: Record<string, any>;

  public prevState: Record<string, any>;

  public hookIndex = 0;

  public hookLimit = 0;

  constructor(component: Component, options: FiberOption) {
    this.component = component;
    this.key = options.key;
  }

  public render(parentElement: Element) {
    const depth = getDepth(this.key);

    currentFiber = this;
    const template = this.component(this.props);

    const parser = new Parser(template, depth + 1);

    this.parentElement = parentElement;

    this.prevVnodeTree = parser.parse();
    this.prevDom = createDOM(this.prevVnodeTree, parentElement);

    this.parentElement.insertBefore(this.prevDom, null);

    if (!this.isMounted) {
      const dep = mountHooks.get(this);
      if (dep) {
        for (const fn of dep) {
          fn();
        }
      }
      this.isMounted = true;
      this.hookLimit = this.hookIndex;
    }
  }

  public reRender() {
    const depth = getDepth(this.key);

    currentFiber = this;
    const template = this.component(this.props);

    const parser = new Parser(template, depth + 1);
    this.nextVnodeTree = parser.parse();

    this.ummount();

    this.nextDom = createDOM(this.nextVnodeTree, this.parentElement);
    this.prevDom.replaceWith(this.nextDom);

    this.prevVnodeTree = this.nextVnodeTree;
    this.prevDom = this.nextDom;

    const dep = updatedHooks.get(this);
    if (dep) {
      for (const fn of dep) {
        fn?.(this.nextState, this.prevState);
      }
    }
  }

  // todo 부분 최적화 방법??
  private ummount() {
    const prevFibers = this.collectFibers(this.prevVnodeTree);
    const nextFibers = this.collectFibers(this.nextVnodeTree);

    for (const fiber of prevFibers) {
      if (!nextFibers.has(fiber)) {
        const dep = unMountHooks.get(fiber);
        if (!dep) continue;
        for (const fn of dep) {
          fn();
        }
        instanceMap.get(fiber.component)?.delete(fiber.key);
        mountHooks.delete(fiber);
        unMountHooks.delete(fiber);
        updatedHooks.delete(fiber);
      }
    }
  }

  private collectFibers(vnode: VNode | undefined, set: Set<Fiber> = new Set()): Set<Fiber> {
    if (!vnode) return set;
    switch (vnode.type) {
      case 'component':
        set.add(vnode.fiber);
        break;
      case 'element':
        vnode.children.forEach((child) => this.collectFibers(child, set));
        break;
      case 'text':
        break;
    }
    return set;
  }
}
