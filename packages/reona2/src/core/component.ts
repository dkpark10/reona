import { isPrimitive } from "../utils";
import type { Props, Data, Methods, ComponentOptions } from "../utils/types";
import { regist, getInstanceMap } from "./fiber";

export function component<
  P extends Props = Props,
  D extends Data = Data,
  M extends Methods = Methods
>(options: ComponentOptions<P, D, M>) {
  const raw = options.data();
  if (isPrimitive(raw)) {
    throw new Error("원시객체가 입니다.");
  }

  // @ts-ignore
  let $props: P = {};
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
      Reflect.set(target, key, value);
      const fiber = getInstanceMap().get(instance);
      fiber?.render();
      return true;
    },
  });

  const boundMethods: M = {} as M;
  for (const key in options.methods) {
    //@ts-ignore
    boundMethods[key] = options.methods[key].bind(proxiedState);
  }

  const instance = {
    ...options,
    ...boundMethods,
    render: function () {
      return options.render.call(proxiedState);
    },
    state: proxiedState,
    setProps: function (props: P) {
      $props = props;
    },
    ...(options.mounted && {
      mounted() {
        return options.mounted!.call(proxiedState);
      },
    }),
    ...(options.unMounted && {
      unMounted() {
        return options.unMounted!.call(proxiedState);
      },
    }),
    ...(options.updated && {
      unMounted() {
        return options.unMounted!.call(proxiedState);
      },
    }),
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
