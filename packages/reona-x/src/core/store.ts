import type { Data } from "../utils/types";
import { isPrimitive } from "../../../shared";
import Fiber, { getCurrentFiber, unMountList } from "./fiber";
import { update } from "./renderer";

export function createStore<D extends Data>(initial: D) {
  if (initial && isPrimitive(initial)) {
    throw new Error("원시객체 입니다. 데이터에 객체 형식이어야 합니다.");
  }

  const listeners = new Set<Fiber>();

  const data = new Proxy(initial, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const prevValue = Reflect.get(receiver, key);
      const result = Reflect.set(target, key, value, receiver);
      if (prevValue !== value) {
        listeners.forEach(function (fiber) {
          update(fiber);
        });
      }
      return result;
    },
  });

  return {
    data,
    subscribe(fiber: Fiber) {
      listeners.add(fiber);
      return function () {
        listeners.delete(fiber);
      };
    },
  };
}

interface StoreOption<D extends Data> {
  data: D,
  subscribe: (fiber: Fiber) => () => void;
}

export function store<D extends Data>(storeOption: StoreOption<D>) {
  const { data, subscribe } = storeOption;
  let fiber = getCurrentFiber();
  if (!fiber) {
    throw new Error('스토어 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  const unSubscribe = subscribe(fiber);
  let dep = unMountList.get(fiber);
  if (!dep) {
    dep = new Set();
    dep.add(unSubscribe);
    unMountList.set(fiber, dep);
  } else {
    dep.add(unSubscribe);
  }
  return data;
}
