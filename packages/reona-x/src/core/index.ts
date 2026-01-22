import { createStore } from './store';
import { createComponent, html } from './component';
import { state, store, mounted, updated, watchProps, ref, setRef, memo, context } from './hooks';
import { rootRender } from './runtime-dom';
import { createContext } from './context';
import {
  type Router,
  createRouter,
  RouteProvider,
  Link,
  useRouter,
  useParams,
  useQueryString,
} from '../experimental/router';

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
  createContext,
  context,
  createRouter,
  RouteProvider,
  Link,
  useRouter,
  useParams,
  useQueryString,
};

export type { Router };
