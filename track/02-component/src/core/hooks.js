import  { getCurrentInstance } from './component-instance';

function isPrimitive(value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

function checkInvalidHook(currentInstance) {
  if (currentInstance.isMounted && currentInstance.hookIndex > currentInstance.hookLimit) {
    throw new Error('훅은 함수 최상단에 선언해야 합니다.');
  }

  if (!currentInstance.isMounted) {
    currentInstance.hookIndex += 1;
  }
}

const states = new WeakMap();

export function state(initial) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('state 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  let stateList = states.get(currentInstance);
  if (!stateList) {
    stateList = [];
    states.set(currentInstance, stateList);
  }

  const stateIndex = currentInstance.stateHookIndex++;

  if (stateList[stateIndex]) {
    return stateList[stateIndex];
  }

  if (initial && isPrimitive(initial)) {
    throw new Error('원시객체 입니다. 객체 형식으로 넣으세요.');
  }

  const data = new Proxy(initial, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const prevValue = Reflect.get(receiver, key);

      const result = Reflect.set(target, key, value, receiver);
      if (prevValue !== value) {
        currentInstance.reRender();
      }
      return result;
    },
  });
  stateList[stateIndex] = data;
  return data;
}