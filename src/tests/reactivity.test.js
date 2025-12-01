import { describe, expect, test } from "vitest";
import { reactive, ref, effect } from "../core/reactivity";

describe("반응성 테스트", () => {
  test("객체", () => {
    const state = reactive({ apple: 10, banana: 10 });

    let result;
    effect(() => {
      result = state.apple + state.banana;
    });

    expect(result).toBe(20);
    state.apple += 10;
    expect(result).toBe(30);
  });

  test("원시 값", () => {
    const state = ref(20);

    let result;
    effect(() => {
      result = state.value;
    });

    expect(result).toBe(20);
    state.value *= 2;
    expect(result).toBe(40);
  });
});
