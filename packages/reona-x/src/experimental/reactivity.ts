import type { Primitive } from '../utils/types';
import { isPrimitive } from '../utils';

let activeEffect: null | Function = null;

export function effect(fn: Function) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

export class Effect {
  constructor(fn: Function) {
    if (!activeEffect) {
      effect(() => {
        fn();
      });
    }
  }
}

// 구조
// WeakMap(
//   target(객체) → Map(
//     key(객체 키) → Set(effect)
//   )
// )
const targetMap = new WeakMap<object, Map<string | symbol, Set<Function>>>();

function track(target: Record<string, any>, key: string | symbol) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
}

function trigger(target: Record<string, any>, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);

  if (deps) {
    deps.forEach((effect) => {
      effect();
    });
  }
}

export function reactive<T extends Record<string, any>>(obj: T) {
  if (isPrimitive(obj)) {
    throw new Error('원시객체가 입니다.');
  }
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      // @ts-ignore
      return target[key];
    },
    set(target, key, value) {
      // @ts-ignore
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });
}

export function ref<T extends Primitive>(value: T) {
  if (!isPrimitive(value)) {
    throw new Error('원시객체가 아닙니다.');
  }
  const obj = {
    value,
  };
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target.value;
    },
    set(target, key, value) {
      target.value = value;
      trigger(target, key);
      return true;
    },
  });
}
