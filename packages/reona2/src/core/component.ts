import { isPrimitive } from "../../../shared";
import type {
  ComponentKey,
  Props,
  Data,
  Methods,
  ComponentOptions,
  ComponentInstance,
  Computed
} from "../utils/types";
import Fiber from "./fiber";

type MapKey = ComponentKey;

/** @description 전역 컴포넌트 관리 map */
let instanceMap: Map<MapKey, Fiber>;

if (__DEV__ || __TEST__) {
  instanceMap = new Map<MapKey, Fiber>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<MapKey, Fiber>();
}

export function getInstanceMap() {
  return instanceMap;
}

interface CreateComponentOption<P> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(
  getInstance: () => any, options?: CreateComponentOption<P>) {
  /** @description 컴포넌트의 depth */
  const func = function getFiber(depth: number) {
    const key = `${depth}${options?.key || '__reona_key__'}`;

    let fiber: Fiber | undefined = instanceMap.get(key);
    if (!fiber) {
      const instance = getInstance() as ComponentInstance<P, Data, Methods>;
      // @ts-ignore
      fiber = new Fiber(instance, { key });
      instanceMap.set(key, fiber);
    }

    if (options && options.props) {
      fiber.instance.$props = options.props;
    }

    fiber.instance.$componentKey = key;
    return fiber;
  }
  func.__isCreateComponent = true;
  return func;
}

export function component<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods,
  C extends Computed = Computed
>(options: ComponentOptions<P, D, M, C>) {
  return function getComponent() {
    // data 함수에서 내부 메소드 사용에 따른 call 호출
    const raw = options.data?.call(options.methods);
    if (raw && isPrimitive(raw)) {
      throw new Error("원시객체 입니다. 데이터에 객체 형식이어야 합니다.");
    }

    let $componentKey: ComponentKey = '';
    let $props: P | undefined = undefined;
    let $prevData: D[keyof D];

    const computedData = {};
    for (const key in options.computed) {
      const v = options.computed[key].call(raw);
      Object.assign(computedData, { [options.computed[key].name]: v });
    }

    const proxiedState = new Proxy(Object.assign(raw || {}, computedData), {
      get(target, key) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {

          // computed 값
          if (options.computed && Object.prototype.hasOwnProperty.call(options.computed, key)) {
            return options.computed?.[key as string].call(target);
          }
          return Reflect.get(target, key);
        }

        if (Object.prototype.hasOwnProperty.call(boundMethods, key)) {
          return boundMethods[key as string];
        }
      },

      set(target, key, value) {
        $prevData = Reflect.get(target, key);

        Reflect.set(target, key, value);
        if (!__TEST__ && !instance.$componentKey) {
          throw new Error('고유 키가 없습니다.');
        }
        const fiber = getInstanceMap().get(instance.$componentKey);
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

    const NOT_PRODUCTION = __DEV__ || __TEST__;

    const instance = {
      ...options,
      ...boundMethods,
      // ...(NOT_PRODUCTION && boundMethods),
      template: function () {
        return options.template.call(proxiedState, instance.$props);
      },
      ...(NOT_PRODUCTION && { state: proxiedState as D }),
      mounted() {
        return options.mounted?.call(proxiedState);
      },
      unMounted() {
        return options.unMounted?.call(proxiedState);
      },
      updated() {
        return options.updated?.call(proxiedState);
      },
      $componentKey,
      $props,
    };
    return instance;
  }
}
