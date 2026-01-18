import type { Props, Data } from '../utils/types';
import { isPrimitive } from '../../../shared';
import ComponentInstance, {
  getCurrentInstance,
  mountHooks,
  unMountHooks,
  updatedHooks,
  watchPropsHooks,
} from './component-instance';
import { update } from './renderer';

function checkInvalidHook(currentInstance: ComponentInstance) {
  if (currentInstance.isMounted && currentInstance.hookIndex > currentInstance.hookLimit) {
    throw new Error('훅은 함수 최상단에 선언해야 합니다.');
  }

  if (!currentInstance.isMounted) {
    currentInstance.hookIndex += 1;
  }
}

export const states = new WeakMap<ComponentInstance, Array<Record<string, any>>>();

export function state<D extends Data>(initial: D) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let stateList = states.get(currentInstance);
  if (!stateList) {
    stateList = [];
    states.set(currentInstance, stateList);
  }

  const stateIndex = currentInstance.stateHookIndex++;

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
      const prevValue = Reflect.get(receiver, key);

      const result = Reflect.set(target, key, value, receiver);
      if (prevValue !== value) {
        update(currentInstance);
      }
      return result;
    },
  });
  stateList[stateIndex] = data;
  return data as D;
}

interface StoreOption<D extends Data> {
  data: D;
  subscribe: (instance: ComponentInstance) => () => void;
}

export function store<D extends Data>(storeOption: StoreOption<D>) {
  const { data, subscribe } = storeOption;
  let currentInstance = getCurrentInstance();
  if (!currentInstance) {
    throw new Error('스토어 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);
  if (currentInstance.isMounted) {
    return data;
  }

  const unSubscribe = subscribe(currentInstance);
  let dep = unMountHooks.get(currentInstance);
  if (!dep) {
    dep = [];
    unMountHooks.set(currentInstance, dep);
  }
  dep.push(unSubscribe);
  return data;
}


export function mounted(callback: () => void) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('mount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);
  if (currentInstance.isMounted) {
    return;
  }

  let dep = mountHooks.get(currentInstance);
  if (!dep) {
    dep = [];
    mountHooks.set(currentInstance, dep);
  }
  dep.push(callback);
}

export function unMounted(callback: () => void) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('unmMount 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);
  if (currentInstance.isMounted) {
    return;
  }

  let dep = unMountHooks.get(currentInstance);
  if (!dep) {
    dep = [];
    unMountHooks.set(currentInstance, dep);
  }
  dep.push(callback);
}

export function updated<D extends Data>(data: D, callback: (prev: D) => void) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('updated 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let dep = updatedHooks.get(currentInstance);
  if (!dep) {
    dep = [];
    updatedHooks.set(currentInstance, dep);
  }

  const index = currentInstance.updatedHookIndex++;

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
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('watchProps 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let dep = watchPropsHooks.get(currentInstance);
  if (!dep) {
    dep = [];
    watchPropsHooks.set(currentInstance, dep);
  }

  const index = currentInstance.watchPropsHookIndex++;
  dep[index] = callback as (prev: Props) => void;
}

export const refs = new WeakMap<ComponentInstance, Array<{ current: unknown }>>();

export function ref<Data>(initial: Data) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('ref 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let refList = refs.get(currentInstance);
  if (!refList) {
    refList = [];
    refs.set(currentInstance, refList);
  }

  const index = currentInstance.refHookIndex++;

  if (refList[index]) {
    return refList[index] as { current: Data };
  }

  refList[index] = { current: initial };
  return refList[index] as { current: Data };
}

export const setRef = function <D extends { current: unknown }>(
  ref: D,
) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('setRef 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  return function (value: unknown) {
    ref.current = value;
  };
};

export const memoizedList = new WeakMap<ComponentInstance, Array<{
  data: unknown;
  callback: () => unknown;
  prevSnapshot: unknown;
  cachedValue: unknown;
}>>();

export function memo<D, R>(data: D, callback: () => R): R {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('memo 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let dep = memoizedList.get(currentInstance);
  if (!dep) {
    dep = [];
    memoizedList.set(currentInstance, dep);
  }

  const index = currentInstance.memoHookIndex++;

  const createSnapshot = (value: D) =>
    isPrimitive(value) ? value : { ...(value as object) };

  const checkChanged = (current: D, prev: unknown): boolean => {
    if (isPrimitive(current)) {
      return current !== prev;
    }
    return Object.keys(current as object).some(
      (key) => (current as any)[key] !== (prev as any)[key]
    );
  };

  if (!dep[index]) {
    const cachedValue = callback();
    dep[index] = {
      data: data,
      callback: callback,
      prevSnapshot: createSnapshot(data),
      cachedValue,
    };
    return cachedValue as R;
  }

  const hasChanged = checkChanged(data, dep[index].prevSnapshot);

  if (hasChanged) {
    const cachedValue = callback();
    dep[index].cachedValue = cachedValue;
    dep[index].prevSnapshot = createSnapshot(data);
    return cachedValue as R;
  }

  return dep[index].cachedValue as R;
}
