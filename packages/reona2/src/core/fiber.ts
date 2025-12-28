import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { createFragmentElement, processMarkers } from "./dom";
import { Parser, type VNode } from "./parser";
import { createDOM } from "./renderer";

type Key = string | number;

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export class Fiber {
  private key: Key;

  private instance: ComponentOptions<Props, Data, Methods>;

  private container: Element;

  private prevVnodeTree: VNode;

  private nextVnodeTree: VNode;

  constructor(instance: ComponentOptions<Props, Data, Methods>, key: Key) {
    this.instance = instance;
    this.key = key;
    this.key;
  }

  public initalize(container: Element) {
    const parser = new Parser(this.instance.render());
    this.prevVnodeTree = parser.parse();

    const dom = createDOM(this.prevVnodeTree);
    this.container = container;
    container.appendChild(dom);
    this.instance.mounted?.();
  }

  public getInstance() {
    return this.instance;
  }

  // public render() {
  //   const result = this.instance.render();
  //   this.fragment = createFragmentElement(result.template);

  //   processMarkers(this.fragment, result.values);

  //   if (this.container) {
  //     this.container.appendChild(this.fragment);
  //     this.instance.mounted?.();
  //   }
  // }

  // public rerender() {
  //   const result = this.instance.render();
  //   this.fragment = createFragmentElement(result.template);

  //   processMarkers(this.fragment, result.values);

  //   if (this.container) {
  //     this.container.replaceChildren(this.fragment);
  //     this.instance.updated?.();
  //   }
  // }

  public rerender() {
    const parser = new Parser(this.instance.render());
    this.nextVnodeTree = parser.parse();
    this.reconciliation();
    const dom = createDOM(this.nextVnodeTree);
    this.container.replaceChildren(dom);

    this.instance.updated?.();
  }

  /**
   * todo
   *  @see {@link https://ko.legacy.reactjs.org/docs/reconciliation.html}
   *  */
  private reconciliation() {
    // 루트 엘리먼트 타입이 다르다면
    if (this.nextVnodeTree.type !== this.prevVnodeTree.type) {
      return;
    }
  }
}

/** @description 전역 컴포넌트 관리 map */
const instanceMap = new WeakMap<ComponentOptions<any, any, any>, Fiber>();

export function getInstanceMap() {
  return instanceMap;
}

/** @description instance를 키로 fiber 객체를 반환 없으면 생성하고 반환 */
export function regist<P extends Props>({
  instance,
  key = "default",
  props,
}: {
  instance: ComponentOptions<P, Data, Methods>;
  key?: Key;
  props?: P;
}): Fiber {
  let fiber = instanceMap.get(instance);

  if (!fiber) {
    if (props) {
      instance.setProps!(props);
    }
    // @ts-ignore
    fiber = new Fiber(instance, key);
    instanceMap.set(instance, fiber);
  }
  return fiber;
}
