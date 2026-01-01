import { html } from "../core/html";
import { component, createComponent } from "../core/component";
import Timer from "./timer";

export default component<
  { foo: number },
  { price: number; quantity: number },
  { increase: () => void; decrease: () => void },
  { double: number; }
>({
  name: "counter",

  data() {
    return {
      price: 5,
      quantity: 2,
    };
  },

  mounted() {
    console.log("counter mounted", document.getElementById("app"));
  },

  updated() {
    console.log("counter updated");
  },

  computed: {
    double() {
      return this.quantity * 4;
    },
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

  template(props) {
    return html`
      <div id="app">
        <button type="button" @click=${this.increase}>증가</button>
        <button type="button" @click=${this.decrease}>감소</button>
        <ul data-testid="${'list'}">
          ${[1,2,3].map((item) => html`<li>${item}</li>`)}
        </ul>
        <section>
          <div>props: ${props?.foo} ${props?.foo} ${props?.foo}</div>
          <div>가격: ${this.price}</div>
          <div>수량: ${this.quantity}</div>
          <div>합산: ${this.quantity * this.price}</div>
          <div>더블: ${this.double}</div>
          ${createComponent(
            Timer, {
              props: {
                quantity: this.quantity
              },
            },
          )}
        </section>
      </div>
    `;
  },
});
