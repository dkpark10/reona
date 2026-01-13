import type { Props, Data } from '../utils/types';
import { isPrimitive } from '../../../shared';
import Fiber, {
  getCurrentFiber,
  mountHooks,
  unMountHooks,
  updatedHooks,
  watchPropsHooks,
} from './fiber';
import { update } from './renderer';

const states = new WeakMap<Fiber, Record<string, any>>();

export function state<D extends Data>(initial: D) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    throw new Error('훅은 함수 최상단에 선언해야 합니다.');
  }

  const existState = states.get(currentFiber);
  if (existState) {
    return existState as D;
  }

  if (initial && isPrimitive(initial)) {
    throw new Error('원시객체 입니다. 데이터는 객체 형식이어야 합니다.');
  }

  let fiber = currentFiber;
  const data = new Proxy(initial, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const prevState = { ...target };
      const prevValue = Reflect.get(receiver, key);

      const result = Reflect.set(target, key, value, receiver);
      if (prevValue !== value) {
        fiber.nextState = target;
        fiber.prevState = prevState;
        update(fiber);
      }
      return result;
    },
  });
  states.set(fiber, data);
  return data as D;
}

export function mounted(callback: () => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('mount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    return;
  }

  currentFiber.hookIndex += 1;
  let dep = mountHooks.get(currentFiber);
  if (!dep) {
    dep = new Set();
    dep.add(callback);
    mountHooks.set(currentFiber, dep);
  } else {
    dep.add(callback);
  }
}

export function updated<D extends Data>(callback: (next: D, prev: D) => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('updated 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    return;
  }

  currentFiber.hookIndex += 1;
  let dep = updatedHooks.get(currentFiber);
  if (!dep) {
    dep = new Set();
    // @ts-ignore
    dep.add(callback);
    updatedHooks.set(currentFiber, dep);
  } else {
    // @ts-ignore
    dep.add(callback);
  }
}

export function unMounted(callback: () => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('unmMount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    return;
  }

  currentFiber.hookIndex += 1;
  let dep = unMountHooks.get(currentFiber);
  if (!dep) {
    dep = new Set();
    dep.add(callback);
    unMountHooks.set(currentFiber, dep);
  } else {
    dep.add(callback);
  }
}


export function watchProps<P extends Props>(callback: (prev: P) => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('watchProps 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    return;
  }

  currentFiber.hookIndex += 1;
  let dep = watchPropsHooks.get(currentFiber);
  if (!dep) {
    dep = new Set();
    // @ts-ignore
    dep.add(callback);
    watchPropsHooks.set(currentFiber, dep);
  } else {
    // @ts-ignore
    dep.add(callback);
  }
}
