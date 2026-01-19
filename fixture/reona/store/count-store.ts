import { createStore } from '../../../packages/reona/src/core';

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
