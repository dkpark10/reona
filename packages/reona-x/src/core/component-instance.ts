import type { Component, Props, Data } from '../utils/types';
import parse, { type VNode } from './parser';
import { reconcile } from '../experimental/reconcile';
import { createDOM } from './runtime-dom';

/** @description 전역 컴포넌트 관리 map */
type InstanceMapValue = Map<string, ComponentInstance>;
let instanceMap: Map<Component, InstanceMapValue>;
export function getInstanceMap() {
  return instanceMap;
}

const NOT_PRODUCTION = __DEV__ || __TEST__;

if (NOT_PRODUCTION) {
  instanceMap = new Map<Component, InstanceMapValue>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<Component, InstanceMapValue>();
}

/** @description 현재 렌더링 되고 있는 컴포넌트 */
let currentInstance: ComponentInstance | null = null;
export function getCurrentInstance() {
  return currentInstance;
}

type ComponentInstanceOption = {
  key: string;
  sequence: number;
};

/** @description 컴포넌트 인스턴스 - 상태, Props, 생명주기, VNode 트리, DOM 참조를 관리 */
export default class ComponentInstance {
  public states: Array<unknown> = [];
  public mountHooks: Array<() => void | (() => () => void)> = [];
  public unMountHooks: Array<() => void> = [];
  public updatedHooks: Array<{
    data: Data;
    callback: (prev: Data) => void;
    prevSnapshot: Data;
  }> = [];
  public watchPropsHooks: Array<(prev: Props) => void> = [];
  public refs: Array<{ current: unknown }> = [];
  public memoizedList: Array<{
    data: unknown;
    callback: () => unknown;
    prevSnapshot: unknown;
    cachedValue: unknown;
  }> = [];

  public parentElement: Element;

  public component: Component;

  public prevVnodeTree: VNode;

  public nextVnodeTree: VNode;

  public currentDom: HTMLElement;

  public isMounted = false;

  public key: string;

  public sequence: number;

  public nextProps?: Props;

  public prevProps?: Props;

  public hookIndex = 0;

  public hookLimit = 0;

  public watchPropsTrigger = false;

  public stateHookIndex = 0;
  public updatedHookIndex = 0;
  public watchPropsHookIndex = 0;
  public refHookIndex = 0;
  public memoHookIndex = 0;

  constructor(component: Component, options: ComponentInstanceOption) {
    this.component = component;
    this.key = options.key;
    this.sequence = options.sequence;
  }

  public hookIndexInitialize() {
    this.stateHookIndex = 0;
    this.updatedHookIndex = 0;
    this.watchPropsHookIndex = 0;
    this.refHookIndex = 0;
    this.memoHookIndex = 0;
  }

  public render(parentElement: Element, isRerender?: boolean) {
    // 부모 리렌더링으로 인한 자식 리렌더링이라면
    if (isRerender) {
      this.hookIndexInitialize();
    }

    currentInstance = this;
    const template = this.component(this.nextProps);

    this.parentElement = parentElement;
    this.prevVnodeTree = parse(template, this.sequence + 1);

    this.currentDom = createDOM(this.prevVnodeTree, parentElement);
    if (this.currentDom) {
      parentElement.insertBefore(this.currentDom, null);
    }

    this.runWatchProps();
    this.runMount();
  }

  public reRender() {
    this.hookIndexInitialize();
    currentInstance = this;
    const template = this.component(this.nextProps);

    this.nextVnodeTree = parse(template, this.sequence + 1);

    this.runUnmount();
    reconcile(this);
    this.runWatchProps();
    this.runUpdate();
  }

  private runWatchProps() {
    if (this.watchPropsTrigger && this.watchPropsHooks) {
      for (const fn of this.watchPropsHooks) {
        if (this.prevProps) {
          fn(this.prevProps);
        }
      }
    }
    this.prevProps = this.nextProps;
    this.watchPropsTrigger = false;
  }

  private runMount() {
    if (this.isMounted) return;

    for (const fn of this.mountHooks) {
      const cleanUp = fn();
      if (cleanUp && typeof cleanUp === 'function') {
        this.unMountHooks!.push(cleanUp);
      }
    }
    this.isMounted = true;
    this.hookLimit = this.hookIndex;
    (this.mountHooks as any) = null;
  }

  private runUpdate() {
    for (const hook of this.updatedHooks) {
      if (!hook) continue;
      const hasChanged = Object.keys(hook.data).some(
        (key) => hook.data[key as keyof Data] !== hook.prevSnapshot[key as keyof Data]
      );
      if (hasChanged) {
        hook.callback(hook.prevSnapshot);
        hook.prevSnapshot = { ...hook.data };
      }
    }
  }

  private runUnmount() {
    const prevInstances = this.collectInstances(this.prevVnodeTree);
    const nextInstances = this.collectInstances(this.nextVnodeTree);

    for (const instance of prevInstances) {
      if (!nextInstances.has(instance)) {
        for (const fn of instance.unMountHooks) {
          fn();
        }
        instance.cleanUp();

        instanceMap.get(instance.component)?.delete(instance.key);
        if ((instanceMap.get(instance.component)?.size || 0) <= 0) {
          instanceMap.delete(instance.component);
        }
      }
    }
  }

  public unmountAll() {
    const instances = this.collectInstances(this.prevVnodeTree);
    instances.add(this);

    for (const instance of instances) {
      for (const fn of instance.unMountHooks) {
        fn();
      }

      instanceMap.get(instance.component)?.delete(instance.key);
      if ((instanceMap.get(instance.component)?.size || 0) <= 0) {
        instanceMap.delete(instance.component);
      }
      instance.isMounted = false;
    }
  }

  public cleanUp() {
    (this.states as any) = null;
    (this.mountHooks as any) = null;
    (this.unMountHooks as any) = null;
    (this.updatedHooks as any) = null;
    (this.watchPropsHooks as any) = null;
    (this.refs as any) = null;
    (this.memoizedList as any) = null;
  }

  private collectInstances(
    vnode: VNode | undefined,
    set: Set<ComponentInstance> = new Set()
  ): Set<ComponentInstance> {
    if (!vnode) return set;
    switch (vnode.type) {
      case 'component':
        set.add(vnode.instance);
        this.collectInstances(vnode.instance.prevVnodeTree, set);
        break;
      case 'element':
        vnode.children.forEach((child) => this.collectInstances(child, set));
        break;
      case 'text':
        break;
    }
    return set;
  }
}
