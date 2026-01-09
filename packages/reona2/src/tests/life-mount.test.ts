import { vi, expect, test } from "vitest";
import { html, component } from "../core/component";
import { rootRender } from "../core/runtime-dom";
import { flushMicrotasks, flushRaf } from "./utils";

test("상태 변경이 되어도 마운트 훅 실행은 1번이 보장 되어야 한다.", async () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);

  const mockFn = vi.fn(() => {
    console.log('mounted', document.getElementById('app'));
  });

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
  expect(document.getElementById('app')).toBeInTheDocument();
  expect(mockFn).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushRaf();
  expect(document.querySelector('[data-testid="count"]')?.textContent).toBe('1');
  expect(mockFn).toHaveBeenCalled();
});
