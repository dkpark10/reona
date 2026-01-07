import type { ComponentKey } from "../utils/types";
import Fiber from "./fiber";

/** @description 전역 컴포넌트 관리 map */
export const instanceMap = new Map<Function, Map<ComponentKey, Fiber>>();
