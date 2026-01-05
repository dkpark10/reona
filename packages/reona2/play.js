class Observable {
  observers = new Set();

  subscribe(fn) {
    this.observers.add(fn);

    return () => {
      this.observers.delete(fn);
    };
  }

  notify(value) {
    this.observers.forEach(function (fn) {
      fn(value);
    });
  }

  clear() {
    this.observers.clear();
  }
}

const computed = {
  value() {
    return 123;
  },
};

function createComputed(computed) {
  
}