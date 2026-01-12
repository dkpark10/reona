import type {
  RenderResult,
  Component,
  Props,
  Data,
} from '../utils/types';
import { isHtmlString } from '../utils';
import { createKey, isPrimitive } from '../../../shared';
import Fiber, { 
  getInstanceMap,
  getCurrentFiber,
  mountHooks,
  unMountHooks,
  updatedHooks
} from './fiber';
import { update } from './renderer';

const states = new WeakMap<Fiber, Record<string, any>>();

export function state<D extends Data>(initial: D) {
  const currentFiber = getCurrentFiber();
  if (currentFiber === null) {
    throw new Error('상태 함수는 컴포넌트 내에서 선언해야 합니다.');
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

export function rootRender(
  container: Element,
  component: Component,
  props?: Parameters<typeof component>[0]
) {
  const getFiber = createComponent(component, {
    props,
  });

  const fiber = getFiber(0);
  fiber.render(container);
}

interface CreateComponentOption<P extends Props> {
  key?: string | number;
  props?: P;
}

export function createComponent<P extends Props>(component: Component, options?: CreateComponentOption<P>) {
  const instanceMap = getInstanceMap();
  /** @description 컴포넌트의 depth */
  const func = function getFiber(depth: number) {
    const key = createKey(depth, options?.key);

    let instanceDeps = instanceMap.get(component);
    if (!instanceDeps) {
      instanceDeps = new Map();
    }

    let fiber: Fiber | undefined = instanceDeps.get(key);
    if (!fiber) {
      fiber = new Fiber(component, { key });
      instanceDeps.set(key, fiber);
      instanceMap.set(component, instanceDeps);
    }

    if (options && options.props) {
      fiber.props = options.props;
    }
    // fiber.instance.$componentKey = key;
    return fiber;
  }
  func.__isCreateComponent = true;
  return func;
}

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderResult {
  let idx = 0;
  const rawString = strings
    .join('%%identifier%%')
    .replace(/%%identifier%%/g, () => `__marker_${idx++}__`);

  if (!isHtmlString(rawString)) throw new Error('잘못된 html 형식입니다.');
  return { template: rawString, values };
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