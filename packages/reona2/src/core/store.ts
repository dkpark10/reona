type State = Record<string, any>;

type Mutation = Record<string, (...args: any[]) => any>;

type StoreOption<S, M> = {
  state: () => S;
  mutation: M;
} & ThisType<S & M>;

export function createStore<S extends State, M extends Mutation>
  (storeOptions: StoreOption<S, M>) {
  const state = storeOptions.state();

  const computed = Object.keys(state).reduce((acc, k) => {
    return {
      ...acc,
      [k]: () => state[k],
    };
  }, {} as { [K in keyof S]: () => S[K] });

  return {
    state: computed,
    mutation: {
      ...storeOptions.mutation,
    },
  }
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
      console.log(this);
    },
  },
});
