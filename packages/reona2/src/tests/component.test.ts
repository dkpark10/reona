import { vi, describe, expect, test } from "vitest";
import counter from "../../../../fixture/counter";

describe("컴포넌트 테스트", () => {
  test("data 변경 시 값의 변경과 watch 콜백을 호출하여야 한다.", () => {
    /**
     * @data price: 5,
      quantity: 2,
     */
    const instance = counter();

    type WatchType = Record<keyof ReturnType<NonNullable<typeof instance.data>>, () => void>;

    const spyWatch = vi.spyOn(instance.watch as WatchType, "quantity");

    instance.increase();
    expect(instance.state!.quantity).toBe(4);
    expect(spyWatch).toHaveBeenCalledWith(4, 2);

    instance.decrease();
    expect(instance.state!.quantity).toBe(2);
    expect(spyWatch).toHaveBeenCalledWith(2, 4);
  });
});
