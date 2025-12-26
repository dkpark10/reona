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

// class Parent {
//   #private = reactive({ a: 1, b: 2 });
//   $key = 'parent';
//   trigger() {
//     this.#private.a += 1;
//   }
//   render() {
//     console.log('parent render');
//     renderComponent(Child, 'child');
//     this.#private.a + this.#private.b;
//   }
// }

// class Child {
//   #private = ref(1);
//   $key = 'child';
//   trigger() {
//     this.#private.value += 1;
//   }
//   render() {
//     console.log('child render');
//     this.#private.value;
//   }
// }

// const componentMap = new Map();
// export function renderComponent(Component, key = 'default') {
//   let keyMap = componentMap.get(Component);
//   if (!keyMap) {
//     keyMap = new Map();
//     componentMap.set(Component, keyMap);
//   }

//   let component = keyMap.get(key);
//   if (!component) {
//     component = new Component();
//     keyMap.set(key, component);
//   }

//   if (!component._effect) {
//     component._effect = effect(() => {
//       component.render();
//     });
//   }
// }

// renderComponent(Parent, 'parent');

// const parent = componentMap.get(Parent).get('parent');
// const child = componentMap.get(Child).get('child');

// parent.trigger();
// child.trigger();
