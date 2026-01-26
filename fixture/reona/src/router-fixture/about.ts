import { html, Link, mounted } from '../../../../packages/reona/src/core';

export default function About() {
  mounted(() => {
    console.log('about mount');

    return () => {
      console.log('about unmount');
    };
  });
  
  return html`
    <div id="app">
      <div>about</div>
      ${Link(html`<div>post</div>`, { href: '/post' })}
      ${Link(html`<div>home</div>`, { href: '/' })}
    </div>`;
}