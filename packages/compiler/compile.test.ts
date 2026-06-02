import { compile } from './compile';

const input = `
  <script>
    const data = state({ count: 0 })
    const onClick = () => { data.count += 1 }
  </script>

  <template>
    <section>
      <button @click=\${onClick}>click</button>
      <span>\${data.count}</span>
    </section>
  </template>
`;

const result = compile(input, 'counter.reona');
console.log(result);
