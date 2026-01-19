import { rootRender } from '../packages/reona-x/src/core';
import {
  Nested,
  Array,
  Condition,
  Counter,
  Refs,
  Store,
  ContextApp,
 } from './reona-x/src';

rootRender(document.getElementById('root')!, ContextApp);