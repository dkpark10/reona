import { isPrimitive, createKey } from "../../../shared";
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
import { instanceMap } from "./instances";

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

interface CreateComponentOption<P extends Props> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(
  getInstance: () => any, options?: CreateComponentOption<P>) {
  /** @description 컴포넌트의 depth */
  const func = function getFiber(depth: number) {
    const key = createKey(depth, options?.key);

    let instanceDeps = instanceMap.get(getInstance);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let fiber: Fiber | undefined = instanceDeps.get(key);
    if (!fiber) {
      const instance = getInstance() as ComponentInstance<P, Data, Methods>;
      // @ts-ignore
      fiber = new Fiber(instance, { key });
      instanceDeps.set(key, fiber);
      instanceMap.set(getInstance, instanceDeps);
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
  const func = function () {
    Object.assign(options, {
      fiberKey: func,
    })
    return getInstance(options);
  }
  return func;
}

function getInstance<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods,
  C extends Computed = Computed
>(options: ComponentOptions<P, D, M, C>) {
  // data 함수에서 내부 메소드 사용에 따른 call 호출
  const raw = options.data?.call(options.methods) || {};
  if (raw && isPrimitive(raw)) {
    throw new Error("원시객체 입니다. 데이터에 객체 형식이어야 합니다.");
  }

  let $componentKey: ComponentKey = '';
  let $props: P | undefined = undefined;
  let $unsubscribes: (() => void)[] = [];
  // @ts-ignore
  let $fiberKey = options.fiberKey;

  function rerRender() {
    if ($fiberKey) {
      const fiber = instanceMap.get($fiberKey)?.get(instance.$componentKey);
      fiber?.reRender();
    }
  };

  if (options.connect) {
    $unsubscribes = options.connect.map((subscribe) =>
      subscribe(rerRender)
    );
  }

  const proxiedState = new Proxy(raw as D, {
    get(target, key, receiver) {
      // computed 값 todo cache
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
      const $prevData: D[keyof D] = Reflect.get(receiver, key);

      const result = Reflect.set(target, key, value, receiver);
      if (!__TEST__ && !instance.$componentKey) {
        throw new Error('고유 키가 없습니다.');
      }

      if ($prevData !== value) {
        rerRender();
        instance.watch?.[key as string]?.(value, $prevData);
      }
      return result;
    },
  });

  const binddMethods: M = {} as M;
  Object.keys(options.methods || {}).forEach((key) => {
    //@ts-ignore
    binddMethods[key] = options.methods[key].bind(proxiedState);
  });

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
      $unsubscribes.forEach((unsubscribes) => {
        unsubscribes();
      });
      return options.unMounted?.call(proxiedState);
    },
    updated: function () {
      return options.updated?.call(proxiedState);
    },
    $componentKey,
    $props,
    $fiberKey,
  };
  return instance;
}
