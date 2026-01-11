import { component, html } from "../../packages/reona2/src/core/component";

export default component<
  {},
  { val1: number; val2: number; },
  { trigger: () => void; }
>({
  name: "counter",

  data() {
    return {
      val1: 0,
      val2: 0,
      val3: 0,
    };
  },

  methods: {
    trigger() {
      this.val1 += 2;
      this.val2 += 2;
      this.val3 += 2;
    },
  },

  template() {
    return html`
      <div id="app">
        <button type="button" @click=${this.trigger}>트리거</button>
        <div>${this.val1}</div>
        <div>${this.val2}</div>
        <div>${this.val3}</div>
      </div>
    `;
  },
});
