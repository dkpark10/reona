const counterStore = {
  state: {
    globalState: 9999,
  },

  mutation: {
    trigger() {
      this.globalState += 1;
    },
  },
};

counterStore.mutation.trigger();
counterStore.mutation.trigger();
counterStore.mutation.trigger();
counterStore.mutation.trigger();
counterStore.mutation.trigger();
