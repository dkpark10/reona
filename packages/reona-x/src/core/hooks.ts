import type { Props, Data, Context } from '../utils/types';
import { isPrimitive } from '../../../shared';
import ComponentInstance, { getCurrentInstance } from './component-instance';
import { update } from './renderer';

function checkInvalidHook(currentInstance: ComponentInstance) {
  if (currentInstance.isMounted && currentInstance.hookIndex > currentInstance.hookLimit) {
    throw new Error('훅은 함수 최상단에 선언해야 합니다.');
  }

  if (!currentInstance.isMounted) {
    currentInstance.hookIndex += 1;
  }
}

export function state<D extends Data>(initial: D) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('state 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  const stateIndex = currentInstance.stateHookIndex++;
  if (currentInstance.states[stateIndex]) {
    return currentInstance.states[stateIndex] as D;
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

  currentInstance.states[stateIndex] = data;
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
  currentInstance.unMountHooks.push(unSubscribe);
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
  currentInstance.mountHooks.push(callback);
}

export function updated<D extends Data>(data: D, callback: (prev: D) => void) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('updated 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  const dep = currentInstance.updatedHooks;
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

  const index = currentInstance.watchPropsHookIndex++;
  currentInstance.watchPropsHooks[index] = callback as (prev: Props) => void;
}

export function ref<Data>(initial: Data) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('ref 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  const index = currentInstance.refHookIndex++;
  const refs = currentInstance.refs;

  if (refs[index]) {
    return refs[index] as { current: Data };
  }

  refs[index] = { current: initial };
  return refs[index] as { current: Data };
}

export function setRef<D extends { current: unknown }>(ref: D) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('setRef 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  return function (value: unknown) {
    ref.current = value;
  };
};

export function memo<D, R>(data: D, callback: () => R): R {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('memo 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  const index = currentInstance.memoHookIndex++;

  const createSnapshot = (value: D) => (isPrimitive(value) ? value : { ...(value as object) });

  const checkChanged = (current: D, prev: unknown): boolean => {
    if (isPrimitive(current)) {
      return current !== prev;
    }
    return Object.keys(current as object).some(
      (key) => (current as any)[key] !== (prev as any)[key]
    );
  };

  const dep = currentInstance.memoizedList;
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

export function context<T extends unknown>(ctx: Context<T>) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('context 함수는 컴포넌트 내에서 선언해야 합니다.');
  }
  return ctx.getContextData();
}