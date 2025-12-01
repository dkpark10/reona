let activeEffect = null;

export function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 구조
// WeakMap(
//   target(객체) → Map(
//     key(객체 키) → Set(effect)
//   )
// )
/** @type {WeakMap<Record<string, any>, Map<string, Set<function>>} */
const targetMap = new WeakMap();

/**
 * @param {Record<string, any>} target
 * @param {string} key
 */
function track(target, key) {
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

/**
 * @param {Record<string, any>} target
 * @param {string} key
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (deps) {
    deps.forEach((effect) => effect());
  }
}

/**
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });
}

/**
 * @param {number | string | boolean | undefined | symbol | bigint} value
 * @returns {{ value: number | string | boolean | undefined | symbol | bigint }}
 */
export function ref(value) {
  const obj = {
    value,
  };
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });
}
