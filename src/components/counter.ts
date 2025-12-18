import { reactive } from "@/core/reactivity";
import { html } from "@/core/template";
import { ReonaElement } from "@/core/element";
import { renderComponent } from "@/core/render";
import { Timer } from "./timer";

export class Counter extends ReonaElement {
  private data = reactive({
    price: 5,
    quantity: 2,
  });

  mounted() {
    console.log('counter 마운트');
  }

  increase() {
    this.data.quantity += 1;
  }

  decrease() {
    this.data.quantity -= 1;
  }

  render() {
    return html`
      <div>
        <button type="button" @click=${this.increase.bind(this)}>증가</button>
        <button type="button" @click=${this.decrease.bind(this)}>감소</button>
        <div>가격: ${this.data.price}</div>
        <div>수량: ${this.data.quantity}</div>
        ${renderComponent(Timer, {
          quantity: this.data.quantity,
        })}
      </div>
    `;
  }
}
