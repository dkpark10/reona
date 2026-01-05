const p = new Proxy({ a : 12 }, {
  get(target, key, receiver) {
    return target[key];
  },

  set(target, key, value, receiver) {
    target[key] = value;
    return true; 
  },
})

p.a;
p.a = 123;