import { describe, expect, test } from "vitest";
import { html } from "../core/html";

/**
 * @param {string} str
 * @returns {string}
 */
function removeSpace(str) {
  return str.replace(/\s+/g, "");
}

describe("html 함수 테스트", () => {
  test("기본", () => {
    const count = 10;
    expect(html`<div>${count}</div>`).toBe("<div>10</div>");
  });

  test("배열", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(
      removeSpace(html`<ul>
        ${arr.map(
          (item) => `<li @click=${() => console.log(item)}>${item}</li>`
        )}
      </ul>`)
    ).toBe(
      removeSpace(`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`)
    );
  });

  test("이벤트 리스너", () => {
    const count = 10;
    const increase = () => {
      console.log(count);
    };

    const decrease = () => {
      console.log(count);
    };

    expect(
      removeSpace(html`
        <div>
          <button type="button" @click=${increase}>증가</button>
          <button type="button" @click=${decrease}>감소</button>
          <div>${count}</div>
        </div>
      `)
    ).toBe(
      removeSpace(`<div>
        <button type="button">증가</button>
        <button type="button">감소</button>
        <div>${count}</div>
      </div>`)
    );
  });
});
