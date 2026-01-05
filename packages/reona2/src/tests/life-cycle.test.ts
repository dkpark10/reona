import { vi, describe, expect, test, beforeEach, afterEach } from "vitest";
import { html, component } from "../core/component";
import { rootRender } from "../core/renderer";

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  document.body.removeChild(document.getElementById('root')!);
});

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("라이프 사이클 테스트", () => {
  test("상태 변경이 되어도 마운트 훅 실행은 1번이 보장 되어야 한다.", async () => {
    const mockFn = vi.fn();

    const C = component({
      mounted: mockFn,

      data() {
        return {
          count: 0,
        };
      },

      methods: {
        trigger() {
          this.count += 1;
        },
      },

      template() {
        return html`
          <div id="app">
            <div data-testid="count">${this.count}</div>
            <button type="button" @click=${this.trigger}>btn</button>
          </div>
        `;
      },
    });

    rootRender(document.getElementById("root")!, C);
    await flushMicrotasks();
    expect(document.getElementById('app')).not.toBeFalsy();
    expect(mockFn).toHaveBeenCalled();

    document.querySelector('button')?.click();
    expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('1');
    expect(mockFn).toHaveBeenCalled();
  });

  test("데이터 변경 시 업데이트 훅 실행이 되어야 한다.", () => {
  });
});
