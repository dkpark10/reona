import type { Data } from '../utils/types';
import { isPrimitive } from '../../../shared';
import Fiber from './fiber';
import { update } from './renderer';

export function createStore<D extends Data>(initial: D) {
  if (initial && isPrimitive(initial)) {
    throw new Error('원시객체 입니다. 데이터에 객체 형식이어야 합니다.');
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
