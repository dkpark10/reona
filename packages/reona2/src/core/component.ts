import { isPrimitive } from "@/utils";
import type { RenderResult } from "./html";

export type ComponentOptions<D, M> = {
  data: () => D;
  render(): RenderResult;
  methods: M;
  mounted?: () => void;
  unMounted?: () => void;
  updated?: () => void;
  state?: D;
} & ThisType<D & M>;

export function component<D extends Record<string, any>, M extends Record<string, () => void>>(
  options: ComponentOptions<D, M>
) {
  const raw = options.data();
  if (isPrimitive(raw)) {
    throw new Error("원시객체가 입니다.");
  }

  const proxiedState = new Proxy(raw, {
    // get(target, key) {
    //   if (key in target) return Reflect.get(target, key);
    //   if (key in options.methods)
    //     // @ts-ignore
    //     return options.methods[key].bind(target);
    // },

    set(target, key, value) {
      Reflect.set(target, key, value);
      options.render.call(proxiedState)
      return true;
    }
  })

  const boundMethods: M = {} as M;
  for (const key in options.methods) {
    //@ts-ignore
    boundMethods[key] = options.methods[key].bind(proxiedState);
  }

  const instance = {
    ...options,
    methods: boundMethods,
    ...(
      options.mounted && {
        mounted() {
          return options.mounted!.call(proxiedState);
        },
      }
    ),
    ...(
      options.unMounted && {
        unMounted() {
          return options.unMounted!.call(proxiedState);
        },
      }
    ),
    ...(
      options.updated && {
        unMounted() {
          return options.unMounted!.call(proxiedState);
        },
      }
    ),
    render: () => {
      return options.render.call(proxiedState);
    },
    state: proxiedState,
  };

  return instance;
}
