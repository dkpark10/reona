import { createStore } from './store';
import {
  createComponent,
  html,
} from './component';
import {
  state,
  store,
  mounted,
  unMounted,
  updated,
  watchProps,
  ref,
  setRef,
  memo,
} from './hooks';
import {
  rootRender
} from './runtime-dom';

export {
  store,
  createStore,
  state,
  rootRender,
  createComponent,
  html,
  mounted,
  unMounted,
  updated,
  ref,
  setRef,
  watchProps,
  memo,
};
