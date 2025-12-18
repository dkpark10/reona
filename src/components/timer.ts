import { ref } from "@/core/reactivity";
import { html } from "@/core/template";
import { ReonaElement } from "@/core/element";

export interface TimerProps {
  quantity: number;
}

export class Timer extends ReonaElement<TimerProps> {
  private intervalTimer: ReturnType<typeof setInterval> | null = null;

  private timer = ref(this.getHHMMRR());

  constructor() {
    super();
  }

  mounted() {
    console.log('timer 마운트');
    if (this.intervalTimer) {
      return;
    }
    this.intervalTimer = setInterval(() => {
      this.timer.value = this.getHHMMRR();
    }, 1_000);
  }

  /** @todo unmounted 구현 */
  unMounted() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  getHHMMRR() {
    const [hour, minute, second] = new Date()
      .toISOString()
      .slice(11, 19)
      .split(":");
    return `${hour}:${minute}:${second}`;
  }

  render() {
    return html`
      <div>
        <span>${this.$props.quantity}</span>
        <time>time: ${this.timer.value}</time>
      </div>
    `;
  }
}
