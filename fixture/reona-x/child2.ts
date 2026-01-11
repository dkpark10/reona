import { html, mounted, unMounted } from "../../packages/reona-x/src/core/component";

interface Child2Props {
  value: number;
}

export default function Child2({ value }: Child2Props) {
  mounted(() => {
    console.log('mounted child2');
  });

  unMounted(() => {
    console.log('unMounted child2');
  })

  return html`
    <div>${value}</div>
  `;
}
