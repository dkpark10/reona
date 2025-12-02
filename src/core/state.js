import { effect, ref, reactive } from "./reactivity.js";
import { isPrimitive } from "../utils/index.js";

export function state(init) {
  const value = isPrimitive(init) ? ref(init) : reactive(init); 

  effect(() => {
    // todo 컴포넌트 렌더링
    console.log(value.value);
  });

  return value;
}