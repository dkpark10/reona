import { vi, expect, test } from "vitest";
import { html, component } from "../core/component";
import { rootRender } from "../core/renderer";

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

test("상태 변경 시 업데이트 훅이 매번 실행되어야 한다.", async () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);

  const mockFn = vi.fn();

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
  await flushMicrotasks();

  document.querySelector('button')?.click();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('1');
  await flushMicrotasks();
  expect(mockFn).toHaveBeenCalledTimes(1);

  document.querySelector('button')?.click();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('2');
  await flushMicrotasks();
  expect(mockFn).toHaveBeenCalledTimes(2);

  document.querySelector('button')?.click();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('3');
  await flushMicrotasks();
  expect(mockFn).toHaveBeenCalledTimes(3);
});
