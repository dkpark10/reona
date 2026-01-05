import { isPrimitive } from "../../../shared";
import type {
  ComponentKey,
  Props,
  Data,
  Methods,
  ComponentOptions,
  ComponentInstance,
  Computed,
  RenderResult,
} from "../utils/types";
import Fiber from "./fiber";

type MapKey = ComponentKey;

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join("%%identifier%%")
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);
  return { template: rawString, values };
}

/** @description 전역 컴포넌트 관리 map */
let instanceMap: Map<MapKey, Fiber>;

if (__DEV__ || __TEST__) {
  instanceMap = new Map<MapKey, Fiber>();
} else {
  // @ts-ignore
  instanceMap = new WeakMap<MapKey, Fiber>();
}

function getInstanceMap() {
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

    const proxiedState = new Proxy(raw || {}, {
      get(target, key, receiver) {
        // computed 값
        if (options.computed && Object.prototype.hasOwnProperty.call(options.computed, key)) {
          return options.computed?.[key as string].call(receiver);
        }

        if (Object.prototype.hasOwnProperty.call(target, key)) {
          return Reflect.get(target, key, receiver);
        }

        if (Object.prototype.hasOwnProperty.call(binddMethods, key)) {
          return binddMethods[key as string];
        }
      },

      set(target, key, value, receiver) {
        $prevData = Reflect.get(receiver, key);

        const result = Reflect.set(target, key, value, receiver);
        if (!__TEST__ && !instance.$componentKey) {
          throw new Error('고유 키가 없습니다.');
        }
        const fiber = getInstanceMap().get(instance.$componentKey);
        fiber?.rerender();

        if ($prevData !== value) {
          instance.watch?.[key as string]?.(value, $prevData);
        }
        return result;
      },
    });

    const binddMethods: M = {} as M;
    for (const key in options.methods) {
      //@ts-ignore
      binddMethods[key] = options.methods[key].bind(proxiedState);
    }

    const NOT_PRODUCTION = __DEV__ || __TEST__;

    const instance = {
      ...options,
      ...binddMethods,
      // ...(NOT_PRODUCTION && boundMethods),
      template: function () {
        return options.template.call(proxiedState, instance.$props);
      },
      ...(NOT_PRODUCTION && { state: proxiedState as D }),
      mounted: function () {
        return options.mounted?.call(proxiedState);
      },
      unMounted: function () {
        return options.unMounted?.call(proxiedState);
      },
      updated: function () {
        return options.updated?.call(proxiedState);
      },
      $componentKey,
      $props,
    };
    return instance;
  }
}
