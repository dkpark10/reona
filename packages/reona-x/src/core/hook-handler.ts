import type { Props, Data } from '../utils/types';
import { type VNode } from './parser';
import ComponentInstance, { getInstanceMap } from './component-instance';

export default class HookHandler {
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

  public isMounted = false;

  public hookIndex = 0;

  public hookLimit = 0;

  public watchPropsTrigger = false;

  public stateHookIndex = 0;
  public updatedHookIndex = 0;
  public watchPropsHookIndex = 0;
  public refHookIndex = 0;
  public memoHookIndex = 0;

  constructor() {
  }

  public hookIndexInitialize() {
    this.stateHookIndex = 0;
    this.updatedHookIndex = 0;
    this.watchPropsHookIndex = 0;
    this.refHookIndex = 0;
    this.memoHookIndex = 0;
  }

  public runWatchProps(prevProps?: Props) {
    if (this.watchPropsTrigger && this.watchPropsHooks) {
      for (const fn of this.watchPropsHooks) {
        if (prevProps) {
          fn(prevProps);
        }
      }
    }
    this.watchPropsTrigger = false;
  }

  public runMount() {
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

  public runUpdate() {
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

  public runUnmount(prevVnode: VNode, nextVnode: VNode) {
    const prevInstances = this.collectInstances(prevVnode);
    const nextInstances = this.collectInstances(nextVnode);

    for (const instance of prevInstances) {
      if (!nextInstances.has(instance)) {
        for (const fn of instance.hookHandler.unMountHooks) {
          fn();
        }
        instance.hookHandler.cleanUp();

        const instanceMap = getInstanceMap();
        instanceMap.get(instance.component)?.delete(instance.key);
        if ((instanceMap.get(instance.component)?.size || 0) <= 0) {
          instanceMap.delete(instance.component);
        }
      }
    }
  }

  public unmountAll(prevVnode: VNode, instance: ComponentInstance) {
    const instances = this.collectInstances(prevVnode);
    instances.add(instance);

    for (const instance of instances) {
      for (const fn of instance.hookHandler.unMountHooks) {
        fn();
      }

      const instanceMap = getInstanceMap();
      instanceMap.get(instance.component)?.delete(instance.key);
      if ((instanceMap.get(instance.component)?.size || 0) <= 0) {
        instanceMap.delete(instance.component);
      }
      instance.hookHandler.isMounted = false;
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
