import { component, html } from "../../packages/reona/src/core/component";

export default component<
  {},
  { org: number; foo: number; },
  { noop: () => void; },
  { cache: number; }
>({
  name: "computed",

  data() {
    return {
      org: 12,
      foo: 0,
    }
  },

  computed: {
    cache() {
      console.log('expensive func');
      return this.org * 2;
    }
  },

  methods: {
    noop() {
      this.foo += 1;
    }
  },

  template() {
    return html`
      <div id="app">
        <button type="button" @click=${this.noop}>click</button>
        <div>${this.cache}</div>
      </div>
    `;
  },
});
