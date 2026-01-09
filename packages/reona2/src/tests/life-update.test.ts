import { vi, expect, test } from "vitest";
import { html, component } from "../core/component";
import { rootRender } from "../core/runtime-dom";
import { flushRaf } from "./utils";

test("상태 변경 시 업데이트 훅이 매번 실행되어야 한다.", async () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);

  const mockFn = vi.fn(() => {
    console.log('updated');
  });

  const C = component({
    data() {
      return {
        count: 0,
      };
    },

    updated: mockFn,

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

  document.querySelector('button')?.click();
  await flushRaf();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('1');
  expect(mockFn).toHaveBeenCalledTimes(1);

  document.querySelector('button')?.click();
  await flushRaf();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('2');
  expect(mockFn).toHaveBeenCalledTimes(2);

  document.querySelector('button')?.click();
  await flushRaf();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('3');
  expect(mockFn).toHaveBeenCalledTimes(3);
});
