import { html } from "../../packages/reona2/src/core/html";
import { component } from "../../packages/reona2/src/core/component";

export default component<
  { quantity: number },
  { timer: string; intervalTimer: null | number },
  { getHHMMRR: () => string }
>({
  name: "timer",

  data() {
    return {
      timer: this.getHHMMRR(),
      intervalTimer: null as null | number,
    };
  },

  mounted() {
    console.log("timer mounted", document.querySelector('time'));
    if (this.intervalTimer) {
      return;
    }
    // this.intervalTimer = setInterval(() => {
    //   this.timer = this.getHHMMRR();
    // }, 1_000);
  },

  methods: {
    getHHMMRR() {
      const [hour, minute, second] = new Date()
        .toISOString()
        .slice(11, 19)
        .split(":");
      return `${hour}:${minute}:${second}`;
    },
  },

  template(props) {
    return html`
      <div>
        <div>================타이머================</div>
        <div>props 수량: ${props?.quantity}</div>
        <time>time: ${this.timer}</time>
      </div>
    `;
  },
});
