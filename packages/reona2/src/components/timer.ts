import { html } from "../core/html";
import { component } from "../core/component";

export default component<
  { price: number },
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
    console.log("timer mounted");
    if (this.intervalTimer) {
      return;
    }

    this.intervalTimer = setInterval(() => {
      this.timer = this.getHHMMRR();
    }, 1_000);
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

  render() {
    return html`
      <div>
        <div>타이머</div>
        <div>${this.price}</div>
        <time>time: ${this.timer}</time>
      </div>
    `;
  },
});
