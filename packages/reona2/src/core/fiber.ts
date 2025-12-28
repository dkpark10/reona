import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { createFragmentElement, processMarkers } from "./dom";
import { Parser } from "./parser";

type Key = string | number;

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export class Fiber {
  private key: Key;

  private instance: ComponentOptions<Props, Data, Methods>;

  private fragment: DocumentFragment;

  private container: Element;

  constructor(instance: ComponentOptions<Props, Data, Methods>, key: Key) {
    this.instance = instance;
    this.key = key;
    this.key;
  }

  public setContainer(container: Element) {
    this.container = container;
  }

  public render() {
    const result = this.instance.render();
    const parser = new Parser(result);
    const h = parser.parse();
    console.log(h);

    this.fragment = createFragmentElement(result.template);

    processMarkers(this.fragment, result.values);

    if (this.container) {
      this.container.appendChild(this.fragment);
      this.instance.mounted?.();
    }
  }

  public rerender() {
    const result = this.instance.render();
    this.fragment = createFragmentElement(result.template);

    processMarkers(this.fragment, result.values);

    if (this.container) {
      this.container.replaceChildren(this.fragment);
      this.instance.updated?.();
    }
  }
}

/** @description 전역 컴포넌트 관리 map */
const instanceMap = new WeakMap<ComponentOptions<any, any, any>, Fiber>();

export function getInstanceMap() {
  return instanceMap;
}

export function regist<P extends Props>({
  instance,
  key = "default",
  props,
}: {
  instance: ComponentOptions<P, Data, Methods>;
  key?: Key;
  props?: P;
}) {
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
