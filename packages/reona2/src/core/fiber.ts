import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { createFragmentElement, processMarkers } from "./html";

type Key = string | number | symbol;

export class Fiber {
  private key: Key;

  private instance: ComponentOptions<Props, Data, Methods>;

  constructor(instance: ComponentOptions<Props, Data, Methods>, key: Key) {
    this.instance = instance;
    this.key = key;
  }

  public render() {
    const result = this.instance.render();
    const { fragment, boundaryStart, boundaryEnd } = createFragmentElement(
      result.template
    );

    processMarkers(fragment, result.values);

    console.log('123123 render', fragment);

    function replace(start: Comment, end: Comment, next: DocumentFragment) {
      let node = start.nextSibling;
      while (node && node !== end) {
        const n = node.nextSibling;
        node.remove();
        node = n;
      }
      end.before(next);
    }

    // replace(boundaryStart, boundaryEnd, fragment);
  }
}

/** @description 전역 컴포넌트 관리 map */
const instanceMap = new WeakMap<
  ComponentOptions<any, any, any>,
  Fiber
>();

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
  const keyMap = instanceMap.get(instance);

  if (!keyMap) {
    const fiber = new Fiber(instance, key);
    instanceMap.set(instance, fiber);
    if (props) {
      instance.setProps!(props);
    }
  }
  return keyMap;
}
