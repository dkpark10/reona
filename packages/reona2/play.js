const p = new Proxy({ a: 12 }, {
  get(target, key, receiver) {
    if (key === 'foo') {
      return 123;
    }
    return Reflect.get(target, key, receiver);
  },

  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    return result;
  },
})

console.log(p.foo);
console.log(p.sadkjas);
