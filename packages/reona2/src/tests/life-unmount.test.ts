import { vi, expect, test } from "vitest";
import { html, component, createComponent } from "../core/component";
import { rootRender } from "../core/renderer";

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

test("unmount 훅 테스트를 한다..", async () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);

  const mountFn = vi.fn();
  const unMountFn = vi.fn();

  const child = component({
    name: "child",

    mounted: mountFn,

    unMounted: unMountFn,

    template() {
      return html`<div>child</div>`;
    },
  });

  const parent = component({
    name: "condition",

    data() {
      return {
        value: 0,
      };
    },

    methods: {
      trigger() {
        this.value += 1;
      },
    },

    template() {
      return html`
        <div id="app">
          <button type="button" @click=${this.trigger}>trigger</button>
          <div>${this.value}</div>
          ${this.value % 2 === 0 ? createComponent(child) : ''}
        </div>
      `;
    },
  });

  rootRender(document.getElementById("root")!, parent);
  await flushMicrotasks();

  document.querySelector('button')?.click();
  await flushMicrotasks();
  expect(unMountFn).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushMicrotasks();
  expect(mountFn).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushMicrotasks();
  expect(unMountFn).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushMicrotasks();
  expect(mountFn).toHaveBeenCalled();
});
