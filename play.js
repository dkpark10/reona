export function isPrimitive(value) {
  return (
    value === null || (typeof value !== "object" && typeof value !== "function")
  );
}

const effectStack = [];
let activeEffect = null;

export function effect(fn) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };

  effectFn();
  return effectFn;
}

const targetMap = new WeakMap();
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

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (deps) {
    deps.forEach((effect) => {
      effect();
    });
  }
}

export function reactive(obj) {
  if (isPrimitive(obj)) {
    throw new Error("원시객체가 입니다.");
  }
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

export function ref(value) {
  if (!isPrimitive(value)) {
    throw new Error("원시객체가 아닙니다.");
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

const obj = reactive({ a: 1, b: 2 });

effect(() => {
  obj.a;
});
