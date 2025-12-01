import { expect, test } from "vitest";
import { html } from "../core/html";

/**
 * @param {string} str
 * @returns {string}
 */
function removeSpace(str) {
  return str.replace(/\s+/g, "");
}

test("html 함수 테스트", () => {
  const count = 10;
  expect(html`<div>${count}</div>`).toBe("<div>10</div>");

  const arr = [1, 2, 3, 4, 5];
  expect(
    removeSpace(html` <ul>
      ${arr.map((item) => `<li>${item}</li>`)}
    </ul>`)
  ).toBe(`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`);
});
