import { html, mounted } from 'reona-x';

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
