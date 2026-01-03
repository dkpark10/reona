type State = Record<string, any>;

type Mutation = Record<string, (...args: any[]) => any>;

type StoreOption<S, M> = {
  state: S;
  mutation: M;
} & ThisType<S & M>;

export function createStore<S extends State, M extends Mutation>
  (storeOptions: StoreOption<S, M>) {
  // const computedState = Object.entries(storeOptions.state).reduce((acc, [k, v]) => {
  //   return {
  //     ...acc,
  //     [k]: () => v,
  //   };
  // }, {});

  return {
    state: storeOptions.state,
    mutation: {
      ...storeOptions.mutation,
    },
  }
}

export const counterStore = createStore({
  state: {
    globalState: 9999,
    unused: false,
  },

  mutation: {
    trigger() {
      this.globalState += 1;
    },
  },
});
