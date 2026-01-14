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

function checkInvalidHook(currentFiber: Fiber) {
  if (currentFiber.isMounted && currentFiber.hookIndex > currentFiber.hookLimit) {
    throw new Error('훅은 함수 최상단에 선언해야 합니다.');
  }

  if (!currentFiber.isMounted) {
    currentFiber.hookIndex += 1;
  }
}

export const states = new WeakMap<Fiber, Array<Record<string, any>>>();

export function state<D extends Data>(initial: D) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);

  let stateList = states.get(currentFiber);
  if (!stateList) {
    stateList = [];
    states.set(currentFiber, stateList);
  }

  const stateIndex = currentFiber.stateHookIndex++;

  if (stateList[stateIndex]) {
    return stateList[stateIndex] as D;
  }

  if (initial && isPrimitive(initial)) {
    throw new Error('원시객체 입니다. 데이터는 객체 형식이어야 합니다.');
  }

  const data = new Proxy(initial, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const prevState = { ...target };
      const prevValue = Reflect.get(receiver, key);

      const result = Reflect.set(target, key, value, receiver);
      if (prevValue !== value) {
        currentFiber.nextState = target;
        currentFiber.prevState = prevState;
        update(currentFiber);
      }
      return result;
    },
  });
  stateList[stateIndex] = data;
  return data as D;
}

interface StoreOption<D extends Data> {
  data: D;
  subscribe: (fiber: Fiber) => () => void;
}

export function store<D extends Data>(storeOption: StoreOption<D>) {
  const { data, subscribe } = storeOption;
  let currentFiber = getCurrentFiber();
  if (!currentFiber) {
    throw new Error('스토어 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);
  if (currentFiber.isMounted) {
    return data;
  }

  const unSubscribe = subscribe(currentFiber);
  let dep = unMountHooks.get(currentFiber);
  if (!dep) {
    dep = [];
    unMountHooks.set(currentFiber, dep);
  }
  dep.push(unSubscribe);
  return data;
}


export function mounted(callback: () => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('mount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);
  if (currentFiber.isMounted) {
    return;
  }

  let dep = mountHooks.get(currentFiber);
  if (!dep) {
    dep = [];
    mountHooks.set(currentFiber, dep);
  }
  dep.push(callback);
}

export function unMounted(callback: () => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('unmMount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);
  if (currentFiber.isMounted) {
    return;
  }

  let dep = unMountHooks.get(currentFiber);
  if (!dep) {
    dep = [];
    unMountHooks.set(currentFiber, dep);
  }
  dep.push(callback);
}

export function updated<D extends Data>(data: D, callback: (prev: D) => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('updated 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);

  let dep = updatedHooks.get(currentFiber);
  if (!dep) {
    dep = [];
    updatedHooks.set(currentFiber, dep);
  }

  const index = currentFiber.updatedHookIndex++;

  if (!dep[index]) {
    dep[index] = {
      data: data,
      callback: callback as (prev: Data) => void,
      prevSnapshot: { ...data },
    };
  } else {
    dep[index].callback = callback as (prev: Data) => void;
  }
}

export function watchProps<P extends Props>(callback: (prev: P) => void) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('watchProps 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentFiber);

  let dep = watchPropsHooks.get(currentFiber);
  if (!dep) {
    dep = [];
    watchPropsHooks.set(currentFiber, dep);
  }

  const index = currentFiber.watchPropsHookIndex++;
  dep[index] = callback as (prev: Props) => void;
}

export const refs = new WeakMap<Fiber, { current: unknown }>();

export function ref<Data>(initial: Data) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('ref 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  const existState = refs.get(currentFiber);
  if (existState) {
    return existState as { current: Data };
  }

  let fiber = currentFiber;
  refs.set(fiber, { current: initial });
  return { current: initial } as { current: Data };
}

export const setRef = function <D extends { current: unknown }>(
  ref: D,
) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('setRef 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  return function (value: unknown) {
    ref.current = value;
  };
};
