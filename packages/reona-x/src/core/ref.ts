import type { Data } from '../utils/types';
import { isPrimitive } from '../../../shared';
import Fiber, { getCurrentFiber } from './fiber';

const refs = new WeakMap<Fiber, { current: Record<string, any> }>();

export function ref<D extends Data>(initial: D) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('ref 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  const existState = refs.get(currentFiber);
  if (existState) {
    return existState as { current: D };
  }

  if (initial && isPrimitive(initial)) {
    throw new Error('원시객체 입니다. ref 파라미터는 객체 형식이어야 합니다.');
  }

  let fiber = currentFiber;
  refs.set(fiber, { current: initial });
  return { current: initial } as { current: D };
}

export const setRef = function <D extends { current: Record<string, any> }>(
  ref: D,
  key: keyof D['current']
) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('setRef 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  if (!ref.current) {
    throw new Error('ref 객체가 아닙니다.');
  }

  return function (value: unknown) {
    ref.current[key as string] = value;
  };
};
