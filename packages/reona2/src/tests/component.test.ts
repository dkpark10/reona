import { beforeEach, afterEach, vi, expect, test, describe } from 'vitest';
import counter from "../../../../fixture/counter";
import nested from "../../../../fixture/nested";
import { html, component, createComponent } from "../core/component";
import { rootRender } from "../core/runtime-dom";
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

describe("컴포넌트 테스트", () => {
  test("data 변경 시 값의 변경과 watch 콜백을 호출하여야 한다.", () => {
    /**
     * @data price: 5,
      quantity: 2,
     */
    const instance = counter();

    type WatchType = Record<keyof ReturnType<NonNullable<typeof instance.data>>, () => void>;

    const spyWatch = vi.spyOn(instance.watch as WatchType, "quantity");

    instance.increase();
    expect(instance.state!.quantity).toBe(4);
    expect(spyWatch).toHaveBeenCalledWith(4, 2);

    instance.decrease();
    expect(instance.state!.quantity).toBe(2);
    expect(spyWatch).toHaveBeenCalledWith(2, 4);
  });

  test("props를 보여주고 컴포넌트는 재사용 가능한 새로운 인스턴스여야 한다.", () => {
    const child = component<{ value: string; }>({
      template() {
        return html`<div id="${this.$props.value}">child</div>`;
      },
    });

    const parent = component({
      template() {
        return html`
          <div id="app">
            ${createComponent(child, {
              props: {
                value: 'props1',
              },
            })}
            ${createComponent(child, {
              props: {
                value: 'props2',
              },
            })}
            ${createComponent(child, {
              props: {
                value: 'props3',
              },
            })}
          </div>
        `;
      },
    });

    rootRender(document.getElementById("root")!, parent);
    expect(document.getElementById('props1')).toBeInTheDocument();
    expect(document.getElementById('props2')).toBeInTheDocument();
    expect(document.getElementById('props3')).toBeInTheDocument();
  });

  test("여러겹으로 중첩된 컴포넌트를 테스트한다.", async () => {
    rootRender(document.getElementById("root")!, nested);
    
    expect(document.getElementById('son')?.textContent).toBe('4');
    expect(document.getElementById('grand-son')?.textContent).toBe('8');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.getElementById('son')?.textContent).toBe('8');
    expect(document.getElementById('grand-son')?.textContent).toBe('16');

    document.querySelector('button')?.click();
    await flushRaf();
    expect(document.getElementById('son')?.textContent).toBe('12');
    expect(document.getElementById('grand-son')?.textContent).toBe('24');
  });
});
