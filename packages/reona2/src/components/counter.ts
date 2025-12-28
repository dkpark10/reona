import { html } from "../core/html";
import { component, registComponent } from "../core/component";
import timer from "./timer";

export default component<
  { foo: number },
  { price: number; quantity: number },
  { increase: () => void; decrease: () => void }
>({
  name: "counter",

  data() {
    return {
      price: 5,
      quantity: 2,
    };
  },

  mounted() {
    console.log("counter mounted", document.getElementById('app'));
  },

  updated() {
    console.log("counter updated");
  },
  
  watch: {
    price(current, prev) {
      console.log(current, prev);
    },

    quantity(current, prev) {
      console.log(current, prev);
    },
  },

  methods: {
    increase() {
      this.quantity += 2;
    },

    decrease() {
      this.quantity -= 2;
    },
  },

  render(props) {
    return html`
      <div id="app">
        <button type="button" @click=${this.increase}>증가</button>
        <button type="button" @click=${this.decrease}>감소</button>
        <section>
          <div>props: ${props?.foo}</div>
          <div>가격: ${this.price}</div>
          <div>수량: ${this.quantity}</div>
          <div>합산: ${this.quantity * this.price}</div>
        </section>
      </div>
    `;
  },
});


        // ${registComponent(
        //   timer, {
        //     price: this.price,
        //   },
        //   "timer"
        // )}