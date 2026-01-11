import { beforeEach, afterEach, vi, expect, test, describe } from 'vitest';
import { mounted, unMounted, state, html, createComponent, rootRender } from '../core/component';
import { flushRaf } from './utils';

beforeEach(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

afterEach(() => {
  if (document.getElementById('root')) {
    document.body.removeChild(document.getElementById('root')!);
  }
});

describe('라이프 사이클 훅 테스트', () => {
  test("조건부 렌더링에 따른 라이프 사이클 훅을 테스트를 한다.", async () => {
    const mountFn1 = vi.fn(() => {
      console.log('mount1');
    });
    const unMountFn1 = vi.fn(() => {
      console.log('unmount1');
    });
    const mountFn2 = vi.fn(() => {
      console.log('mount2');
    });
    const unMountFn2 = vi.fn(() => {
      console.log('unmount2');
    });

    function Child() {
      mounted(mountFn1);
      unMounted(unMountFn1);
      return html`<div></div>`;
    }
    function Child2() {
      mounted(mountFn2);
      unMounted(unMountFn2);
      return html`<div></div>`;
    }

    function Parent() {
      const data = state({
        bool: true,
      });

      const trigger = () => {
        data.bool = !data.bool;
      };

      return html`
        <div id="app">
          <button type="button" @click=${trigger}>trigger</button>
          ${data.bool ?
          createComponent(Child, {
            props: {
              value: 1,
            },
          })
          : createComponent(Child2, {
            props: {
              value: 2
            },
          })
        }
        </div>
      `;
    }

    rootRender(document.getElementById("root")!, Parent);

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
})

