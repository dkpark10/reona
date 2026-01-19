import { createStore } from './store';
import { createComponent, html } from './component';
import { state, store, mounted, updated, watchProps, ref, setRef, memo } from './hooks';
import { rootRender } from './runtime-dom';

export {
  store,
  createStore,
  state,
  rootRender,
  createComponent,
  html,
  mounted,
  updated,
  ref,
  setRef,
  watchProps,
  memo,
};
