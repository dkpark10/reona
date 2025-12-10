import { reactive } from "@/core/reactivity";
import { html } from "@/core/html";
import { Children } from "./children";
import { Timer } from "./timer";
import { ReonaElement } from "@/core/element";

export class Counter extends ReonaElement {
  private data = reactive({
    price: 5,
    quantity: 2,
  });

  increase() {
    this.data.quantity += 1;
  }

  decrease() {
    this.data.quantity -= 1;
  }

  render() {
    return html`
      <div id="root">
        <button type="button" @click=${this.increase.bind(this)}>증가</button>
        <button type="button" @click=${this.decrease.bind(this)}>감소</button>
        <div>가격 X 수량: ${this.data.price * this.data.quantity}</div>
        ${new Timer()}
        <div>가격 X 수량: ${this.data.price * this.data.quantity}</div>
        ${new Children({ quantity: this.data.quantity })}
      </div>
    `;
  }
}
