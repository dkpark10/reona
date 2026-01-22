import type { Component, Props } from '../utils/types';
import parse, { type VNode } from './parser';
import { reconcile } from '../experimental/reconcile';
import { createDOM } from './runtime-dom';
import HookHandler from './hook-handler';

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
  public hookHandler: HookHandler

  public parentElement: Element;

  public component: Component;

  public prevVnodeTree: VNode;

  public nextVnodeTree: VNode;

  public currentDom: HTMLElement;

  public key: string;

  public sequence: number;

  public nextProps?: Props;

  public prevProps?: Props;

  constructor(component: Component, options: ComponentInstanceOption) {
    this.component = component;
    this.key = options.key;
    this.sequence = options.sequence;
    this.hookHandler = new HookHandler();
  }

  public render(parentElement: Element, isRerender?: boolean) {
    // 부모 리렌더링으로 인한 자식 리렌더링이라면
    if (isRerender) {
      this.hookHandler.hookIndexInitialize();
    }

    currentInstance = this;
    const template = this.component(this.nextProps);

    this.parentElement = parentElement;
    this.prevVnodeTree = parse(template, this.sequence + 1);

    this.currentDom = createDOM(this.prevVnodeTree, parentElement);
    if (this.currentDom) {
      parentElement.insertBefore(this.currentDom, null);
    }

    this.hookHandler.runWatchProps(this.prevProps);
    this.prevProps = this.nextProps,
    this.hookHandler.runMount();
  }

  public reRender() {
    this.hookHandler.hookIndexInitialize();
    currentInstance = this;
    const template = this.component(this.nextProps);

    this.nextVnodeTree = parse(template, this.sequence + 1);

    this.hookHandler.runUnmount(this.prevVnodeTree, this.nextVnodeTree);
    reconcile(this);
    this.hookHandler.runWatchProps(this.prevProps);
    this.prevProps = this.nextProps,
    this.hookHandler.runUpdate();
  }
}
