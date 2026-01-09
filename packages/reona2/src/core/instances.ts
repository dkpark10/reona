import type { ComponentKey } from "../utils/types";
import Fiber from "./fiber";

const NOT_PRODUCTION = __DEV__ || __TEST__;

/** @description 전역 컴포넌트 관리 map */
export let instanceMap: Map<Function, Map<ComponentKey, Fiber>> | WeakMap<Function, Map<ComponentKey, Fiber>>;

if (NOT_PRODUCTION) {
  instanceMap = new Map<Function, Map<ComponentKey, Fiber>>();
} else {
  instanceMap = new WeakMap<Function, Map<ComponentKey, Fiber>>();
}
