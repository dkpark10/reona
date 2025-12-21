import { describe, expect, test } from "vitest";
import counter from "@/components/counter";

describe("컴포넌트 테스트", () => {
  test("값 반응형 테스트", () => {
    /**
     * @data price: 5,
      quantity: 2,
     */
    const instance = counter;
    instance.methods.increase();
    expect(instance.state.quantity).toBe(4);
    instance.methods.decrease();
    expect(instance.state.quantity).toBe(2);
  });
});
