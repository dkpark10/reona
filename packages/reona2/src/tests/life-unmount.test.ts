import { vi, expect, test } from "vitest";
import { html, component, createComponent } from "../core/component";
import { rootRender } from "../core/runtime-dom";
import { flushRaf } from "./utils";

test("unmount 훅 테스트를 한다.", async () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);

  const mountFn1 = vi.fn();
  const unMountFn1 = vi.fn();
  const mountFn2 = vi.fn();
  const unMountFn2 = vi.fn();

  const child1 = component({
    name: "child1",

    mounted: mountFn1,

    unMounted: unMountFn1,

    template() {
      return html`<div>child</div>`;
    },
  });

  const child2 = component({
    name: "child2",

    mounted: mountFn2,

    unMounted: unMountFn2,

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
          ${this.value % 2 === 0 ? createComponent(child1) : createComponent(child2)}
        </div>
      `;
    },
  });

  rootRender(document.getElementById("root")!, parent);

  document.querySelector('button')?.click();
  await flushRaf();
  expect(unMountFn1).toHaveBeenCalled();
  expect(mountFn2).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushRaf();
  expect(unMountFn2).toHaveBeenCalled();
  expect(mountFn1).toHaveBeenCalled();

  await flushRaf();
  expect(unMountFn1).toHaveBeenCalled();
  expect(mountFn2).toHaveBeenCalled();

  document.querySelector('button')?.click();
  await flushRaf();
  expect(unMountFn2).toHaveBeenCalled();
  expect(mountFn1).toHaveBeenCalled();
});
