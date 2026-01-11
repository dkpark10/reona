import { html, state, mounted } from "../core/temp";

interface CounterProps {
  value: number;
}

export default function Counter({ value }: CounterProps) {
  const data = state({
    price: 5,
    quantity: 2,
  });

  const increase = () => {
    data.price += 2;
  };

  const decrease = () => {
    data.price -= 2;
  };

  mounted(() => {
    console.log('mounted 123', document.getElementById('app'));
  });

  return html`
    <div id="app">
      <button type="button" @click=${increase}>증가</button>
      <button type="button" @click=${decrease}>감소</button>
      <div>props: ${value}</div>
      <div>가격: ${data.price}</div>
      <div>수량: ${data.quantity}</div>
    </div>
  `;
}
