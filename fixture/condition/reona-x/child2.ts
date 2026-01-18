import { html, mounted } from '../../../packages/reona-x/src/core';

interface Child2Props {
  value: number;
}

export default function Child2({ value }: Child2Props) {
  mounted(() => {
    console.log('mounted child2');
    return () => {
      console.log('unMounted child2');
    }
  });

  return html`
    <div>${value}</div>
  `;
}
