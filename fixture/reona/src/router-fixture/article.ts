import { html, useParams, useQueryString } from '../../../../packages/reona/src/core';

export default function Article() {
  const params = useParams();
  const qs = useQueryString();
  console.log(params);
  console.log(qs);

  return html`
    <article>
      article ${params.postId}
    </article>
  `;
}
