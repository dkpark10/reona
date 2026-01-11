import type {
  RenderResult,
  Component,
  Props,
  Data,
} from "../utils/types";
import { isHtmlString } from "../utils";
import { createKey, getDepth } from "../../../shared";
import Parser, { type VNode } from "./parser";
import { createDOM } from "./runtime-dom";

/** @description 전역 컴포넌트 관리 map */
let instanceMap: Map<Component, Map<string, Fiber>>;

const NOT_PRODUCTION = __DEV__ || __TEST__;

if (NOT_PRODUCTION) {
  instanceMap = new Map<Component, Map<string, Fiber>>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<Component, Map<string, Fiber>>();
}

let currentFiber: Fiber | null = null;
const states = new WeakMap<Fiber, Record<string, any>>();
const mountList = new WeakMap<Fiber, () => void>();
const unMountList = new WeakMap<Fiber, () => void>();

export function state<D extends Data>(initial: D) {
  if (currentFiber === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  const existState = states.get(currentFiber);
  if (existState) {
    return existState as D;
  }

  let fiber = currentFiber;
  const data = new Proxy(initial, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      fiber?.reRender();
      return result;
    },
  });
  states.set(currentFiber, data);
  return data as D;
}

export function rootRender(
  container: Element,
  component: Component,
  props?: Parameters<typeof component>[0]
) {
  const getFiber = createComponent(component, {
    props,
  });

  const fiber = getFiber(0);
  fiber.render(container);
}

interface CreateComponentOption<P extends Props> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(component: Component, options: CreateComponentOption<P>) {
  /** @description 컴포넌트의 depth */
  const func = function getFiber(depth: number) {
    const key = createKey(depth, options?.key);

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let fiber: Fiber | undefined = instanceDeps.get(key);
    if (!fiber) {
      fiber = new Fiber(component, { key });
      instanceDeps.set(key, fiber);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      fiber.props = options.props;
    }
    // fiber.instance.$componentKey = key;
    return fiber;
  }
  func.__isCreateComponent = true;
  return func;
}

type FiberOption = {
  key: string;
}

export class Fiber {
  private key: string;

  private parentElement: Element;

  private component: Component;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  private prevDom: HTMLElement;

  private nextDom: HTMLElement;

  public isMounted = false;

  public props?: Props;

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
      const fn = mountList.get(this);
      fn?.();
      this.isMounted = true;
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
    this.parentElement.replaceChildren(this.nextDom);

    this.prevVnodeTree = this.nextVnodeTree;
    this.prevDom = this.nextDom;
  }

  // todo 부분 최적화 방법??
  private ummount() {
    const prevFibers = this.collectFibers(this.prevVnodeTree);
    const nextFibers = this.collectFibers(this.nextVnodeTree);

    for (const fiber of prevFibers) {
      if (!nextFibers.has(fiber)) {
        const fn = unMountList.get(fiber);
        fn?.();
        instanceMap.get(fiber.component)?.delete(fiber.key);
      }
    }
  }

  private collectFibers(
    vnode: VNode | undefined,
    set: Set<Fiber> = new Set()
  ): Set<Fiber> {
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

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error("잘못된 html 형식입니다.");
  return { template: rawString, values };
}

export function mounted(callback: () => void) {
  if (currentFiber === null) {
    throw new Error('mount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }
  mountList.set(currentFiber, callback);
}

export function unMounted(callback: () => void) {
  if (currentFiber === null) {
    throw new Error('mount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }
  unMountList.set(currentFiber, callback);
}