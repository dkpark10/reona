import { vi, describe, expect, test } from "vitest";
import counter from "../../../../fixture/counter";
import { html, component, createComponent } from "../core/component";
import { rootRender } from "../core/renderer";

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

  test("동일한 컴포넌트는 재사용 가능하여야 한다.", () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    const child = component<{ value: string; }>({
      template(props) {
        return html`<div id="${props?.value}">child</div>`;
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
});
