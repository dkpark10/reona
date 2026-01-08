import { component, html } from "../../packages/reona/src/core/component";

export default component<
  {},
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

  template() {
    return html`
      <div id="app">
        <button type="button" @click=${this.increase}>증가</button>
        <button type="button" @click=${this.decrease}>감소</button>
        <section>
          <div>가격: ${this.price}</div>
          <div>수량: ${this.quantity}</div>
          <div>합산: ${this.quantity * this.price}</div>
          <div>더블: ${this.double}</div>
        </section>
      </div>
    `;
  },
});

