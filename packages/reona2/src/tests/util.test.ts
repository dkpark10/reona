import { describe, expect, test } from "vitest";
import { isHtmlString } from "../utils";
import { isPrimitive } from "../../../shared"

describe("유틸 테스트", () => {
  test("원시객체 여부 판별을 테스트 한다.", () => {
    expect(isPrimitive("123123")).toBeTruthy();
    expect(isPrimitive(123123)).toBeTruthy();
    expect(isPrimitive(true)).toBeTruthy();
    expect(isPrimitive(null)).toBeTruthy();
    expect(isPrimitive(undefined)).toBeTruthy();
    expect(isPrimitive(Symbol("sym"))).toBeTruthy();

    expect(isPrimitive([])).not.toBeTruthy();
    expect(isPrimitive({})).not.toBeTruthy();
    expect(isPrimitive(class Foo {})).not.toBeTruthy();
  });

  test("html 형식인지 테스트 한다.", () => {
    expect(isHtmlString("123123")).not.toBeTruthy();
    expect(isHtmlString("<div>123</div>")).toBeTruthy();
    expect(isHtmlString("<span>text</span>")).toBeTruthy();
    expect(
      isHtmlString(
        [1, 2, 3, 4, 5]
          .map((item) => `<li @click=${() => console.log(item)}>${item}</li>`)
          .join("")
      )
    ).toBeTruthy();
  });
});
