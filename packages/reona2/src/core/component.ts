import { isPrimitive } from "../utils";
import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { regist, getInstanceMap } from "./fiber";

export function component<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods
>(options: ComponentOptions<P, D, M>) {
  // data 함수에서 내부 메소드 사용에 따른 call 호출
  const raw = options.data.call(options.methods);
  if (isPrimitive(raw)) {
    throw new Error("원시객체가 입니다.");
  }

  // @ts-ignore
  let $props: P = {};
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
    render: function () {
      return options.render.call(proxiedState, $props);
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

export function registComponent<P extends Props = Props>(
  instance: ComponentOptions<P, Data, Methods>,
  props: P,
  key = "default"
) {
  return regist({
    // @ts-ignore
    instance,
    props,
    key,
  });
}
