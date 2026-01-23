import  { getCurrentInstance } from './component-instance';

const renderQueue = new Set();
let rafId = null;

export function update(instance) {
  renderQueue.add(instance);

  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    try {
      renderQueue.forEach((instance) => {
        instance.reRender();
      });
    } finally {
      renderQueue.clear();
      rafId = null;
    }
  });
}

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

export function state(initial) {
  const currentInstance = getCurrentInstance();
  if (currentInstance === null) {
    throw new Error('state 함수는 컴포넌트 내에서 선언해야 합니다.');
  }

  checkInvalidHook(currentInstance);

  const stateIndex = currentInstance.stateHookIndex++;
  if (currentInstance.states[stateIndex]) {
    return currentInstance.states[stateIndex];
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
        update(currentInstance);
      }
      return result;
    },
  });
  currentInstance.states[stateIndex] = data;
  return data;
}