// import { Observable } from "../../../shared";

type State = Record<string, any>;

type Mutation = Record<string, (...args: any[]) => any>;

type StoreOption<S, M> = {
  state: () => S;
  mutation: M;
} & ThisType<S & M>;

export function createStore<S extends State, M extends Mutation>(
  storeOptions: StoreOption<S, M>
) {
  const rawState = storeOptions.state();

  const listeners = new Set<() => void>();

  const proxyState = new Proxy(rawState, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      listeners.forEach(function(fn) {
        fn();
      });
      return result;
    },
  });

  const bindMutation = {} as M;
  for (const k in storeOptions.mutation) {
    // @ts-ignore
    bindMutation[k] = storeOptions.mutation[k].bind(proxyState);
  }

  return {
    state: proxyState,
    mutation: bindMutation,
    subscribe(fn: () => void) {
      // fiber.rerender 함수를 받아야 한다.
      listeners.add(fn);
      return function() {
        listeners.delete(fn);
      };
    },
  };
}

export const counterStore = createStore({
  state() {
    return {
      globalState: 9999,
    };
  },

  mutation: {
    trigger() {
      this.globalState += 1;
    },
  },
});
