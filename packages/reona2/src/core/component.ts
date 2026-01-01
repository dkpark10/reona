import { isPrimitive } from "../utils";
import type { Props, Data, Methods, ComponentOptions, ComponentInstance } from "../utils/types";
import { Fiber } from "./fiber";

/** @description 전역 컴포넌트 관리 map */
let instanceMap: Map<ComponentInstance<any, any, any>, Fiber>;

if (__DEV__ || __TEST__) {
  instanceMap = new Map<ComponentInstance<any, any, any>, Fiber>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<ComponentInstance<any, any, any>, Fiber>();
}

export function getInstanceMap() {
  return instanceMap;
}

/** @description instance를 키로 fiber 객체를 반환 없으면 생성하고 반환 */
export function createComponent<P extends Props>(
  getInstance: () => ComponentInstance<P, Data, Methods>, {
    props,
    key = "default",
  }: {
    key?: string | number;
    props?: P;
  }): Fiber {
  const instance = getInstance();
  let fiber = instanceMap.get(instance);

  if (props) {
    instance.setProps!(props);
  }

  if (!fiber) {
    fiber = new Fiber(instance, key);
    instanceMap.set(instance, fiber);
  }
  return fiber;
}

export function component<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods
>(options: ComponentOptions<P, D, M>) {
  return function getComponent() {
    // data 함수에서 내부 메소드 사용에 따른 call 호출
    const raw = options.data.call(options.methods);
    if (isPrimitive(raw)) {
      throw new Error("원시객체 입니다. 데이터에 객체 형식이어야 합니다.");
    }

    let $props: P | undefined = undefined;
    let $prevData: D[keyof D];

    const proxiedState = new Proxy(raw, {
      get(target, key) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          return Reflect.get(target, key);
        }
        if (Object.prototype.hasOwnProperty.call(boundMethods, key)) {
          return boundMethods[key as string];
        }
      },

      set(target, key, value) {
        $prevData = Reflect.get(target, key);

        Reflect.set(target, key, value);
        const fiber = getInstanceMap().get(instance);
        fiber?.rerender();

        if ($prevData !== value) {
          instance.watch?.[key as string]?.(value, $prevData);
        }
        return true;
      },
    });

    const boundMethods: M = {} as M;
    for (const key in options.methods) {
      //@ts-ignore
      boundMethods[key] = options.methods[key].bind(proxiedState);
    }

    const boundData = {};
    for (const key in raw) {
      //@ts-ignore
      boundData[key] = options.watch?.[key].bind(proxiedState, $prevData);
    }

    const NOT_PRODUCTION = __DEV__ || __TEST__;

    const instance = {
      ...options,
      ...boundMethods,
      // ...(NOT_PRODUCTION && boundMethods),
      template: function () {
        return options.template.call(proxiedState, $props);
      },
      ...(NOT_PRODUCTION && { state: proxiedState }),
      setProps: function (props: P) {
        $props = props;
      },
      mounted() {
        return options.mounted?.call(proxiedState);
      },
      unMounted() {
        return options.unMounted?.call(proxiedState);
      },
      updated() {
        return options.updated?.call(proxiedState);
      },
    };
    return instance;
  }
}
