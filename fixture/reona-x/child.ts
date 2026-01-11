import { html, mounted, unMounted } from "../../packages/reona-x/src/core/component";

interface ChildProps {
  value: number;
}

export default function Child({ value }: ChildProps) {
  mounted(() => {
    console.log('mounted child');
  });

  unMounted(() => {
    console.log('unMounted child');
  })

  return html`
    <div>${value}</div>
  `;
}
