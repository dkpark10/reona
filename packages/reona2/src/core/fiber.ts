import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { createFragmentElement, processMarkers } from "./html";

type Key = string | number;

// todo 너무 fiber 역할이 많고 명확하지가 않다..
export class Fiber {
  private key: Key;

  private instance: ComponentOptions<Props, Data, Methods>;

  private fragment: DocumentFragment;

  private boundaryStart: Comment;

  private boundaryEnd: Comment;

  constructor(instance: ComponentOptions<Props, Data, Methods>, key: Key) {
    this.instance = instance;
    this.key = key;
    this.initialize();
  }

  public initialize() {
    const result = this.instance.render();
    this.fragment = createFragmentElement(result.template);

    this.boundaryStart = document.createComment(`${this.key}:start`);
    this.boundaryEnd = document.createComment(`${this.key}:end`);
    this.fragment.prepend(this.boundaryStart);
    this.fragment.append(this.boundaryEnd);

    processMarkers(this.fragment, result.values);
  }

  public getFragment() {
    return this.fragment;
  }

  public render() {
    const result = this.instance.render();
    const fragment = createFragmentElement(result.template);
    processMarkers(fragment, result.values);

    let node = this.boundaryStart.nextSibling;
    while (node && node !== this.boundaryEnd) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }

    this.boundaryEnd.before(fragment);
    this.fragment = fragment;
  }
}

/** @description 전역 컴포넌트 관리 map */
const instanceMap = new WeakMap<ComponentOptions<any, any, any>, Fiber>();

export function getInstanceMap() {
  return instanceMap;
}

export function regist<P = Props>({
  instance,
  key = "default",
  props,
}: {
  instance: ComponentOptions<Props, Data, Methods>;
  key?: Key;
  props?: P;
}) {
  let fiber = instanceMap.get(instance);

  if (!fiber) {
    fiber = new Fiber(instance, key);
    instanceMap.set(instance, fiber);
    if (props) {
      instance.setProps!(props);
    }
  }
  return fiber;
}
