import type {
  RenderResult,
  Component,
  Props,
  Data,
} from "../utils/types";
import { reactive, effectScheduler } from "./reactivity";
import { isHtmlString } from "../utils";
import { createKey, getDepth } from "../../../shared";
import Parser, { type VNode } from "./parser";
import { createDOM } from "./dom";

/** @description 전역 컴포넌트 관리 map */
const instanceMap = new WeakMap<Component, Map<string, Fiber>>();

/** @description 함수형 컴포넌트에서 재호출 시 싱글톤을 유지하기 위한 상태 리스트 */
let currentComponent: number | null = null;
const states = new Map<number, Record<string, any>>();

const lifeHooks = new Map<number, Set<Function>>();

export function state<D extends Data>(initial: D) {
  if (currentComponent === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  const existState = states.get(currentComponent);
  if (existState) {
    return existState as D;
  }

  const data = reactive(initial);
  states.set(currentComponent, data);
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

  private component: Component;

  private vnodeTree: VNode;

  private vdom: HTMLElement;

  public isMounted = false;

  public props?: Props;

  constructor(component: Component, options: FiberOption) {
    this.component = component;
    this.key = options.key;
  }

  public render(parentElement: Element) {
    effectScheduler.add(() => {
      const depth = getDepth(this.key);
      currentComponent = depth;
      const template = this.component(this.props);
      const parser = new Parser(template, depth + 1);

      this.vnodeTree = parser.parse();
      this.vdom = createDOM(this.vnodeTree, parentElement);
      parentElement.replaceChildren(this.vdom);
      this.isMounted = true;
    });
    effectScheduler.run();
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

export function watch<D extends Data>(value: D,
  callback: (current: D, prev: D) => void) {
  effectScheduler.add(() => {
    console.log(callback, value);
  })
}
