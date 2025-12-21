import { html } from "../core/html";
import { component, registComponent } from "../core/component";
import timer from "./timer";

export default component({
  data: () => {
    return {
      price: 5,
      quantity: 2,
    };
  },

  methods: {
    increase() {
      this.quantity += 2;
    },

    decrease() {
      this.quantity -= 2;
    },
  },

  render() {
    return html`
      <div>
        <button type="button" @click=${this.increase}>증가</button>
        <button type="button" @click=${this.decrease}>감소</button>
        <div>가격: ${this.price}</div>
        <div>수량: ${this.quantity}</div>
        ${registComponent(timer, {
          price: this.price,
        })}
      </div>
    `;
  },
});
