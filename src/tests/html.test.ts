import { describe, expect, test } from "vitest";
import { html, createRenderableDom } from "@/core/html";

function removeSpace(str: string) {
  return str.replace(/\s+/g, "");
}

function parseHtml(str: TemplateStringsArray, ...rest: any[]): string {
  const [rawStrings, values] = html(str, ...rest);
  const dom = createRenderableDom(rawStrings as string, values as any[]);
  return removeSpace(dom.innerHTML as string);
}

describe("html 함수 테스트", () => {
  test("기본", () => {
    const count = 10;
    expect(parseHtml`<div>${count}</div>`).toBe("<div>10</div>");
  });

  test.skip("배열", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(
      parseHtml`<ul>
        ${arr.map(
          (item) => html`<li @click=${() => console.log(item)}>${item}</li>`
        ).join('')}
      </ul>`
    ).toBe(
      removeSpace(`<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>`)
    );
  });

  test("엘리먼트", () => {
    const count = 10;
    expect(parseHtml`<div>${html`<span>${count}</span>`}</div>`).toBe("<div><span>10</span></div>");
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
      parseHtml`
        <div>
          <button type="button" @click=${increase}>증가</button>
          <button type="button" @click=${decrease}>감소</button>
          <div>${count}</div>
        </div>
      `
    ).toBe(
      removeSpace(
      `<div>
        <button type="button">증가</button>
        <button type="button">감소</button>
        <div>${count}</div>
      </div>`
      )
    );
  });
});
