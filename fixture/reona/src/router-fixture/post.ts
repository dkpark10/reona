import { mounted, html, Link } from '../../../../packages/reona/src/core';

export default function Post() {
  mounted(() => {
    console.log('post mount');

    return () => {
      console.log('post unmount');
    };
  });

  return html`
    <div id="app">
      <div>post</div>
      ${Link(html`<div>home</div>`, { href: '/' })}
      ${Link(html`<div>about</div>`, { href: '/about' })}
    </div>
  `;
}
