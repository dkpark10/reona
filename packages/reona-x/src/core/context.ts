import type { Data } from "../utils/types";

function createContex(inital: Data) {
  return inital;
}

function createContextImpl() {
  type Obj = Record<string, any>;
  const ctx: WeakMap<Obj, Obj> = new WeakMap();

  return {
    getContext: (key: Obj) => {
      return ctx.get(key);
    },
    setContext: (key: Obj, value: Obj) => {
      ctx.set(key, value);
    },
  }
}

export const contextProvider = createContextImpl();
