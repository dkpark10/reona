import { html, component, createComponent } from "../../packages/reona2/src/core/component";
import child1 from "./child1";
import child2 from "./child2";

export default component({
  name: "store",

  template() {
    return html`
      <div id="app">
        ${createComponent(child1)}
        ${createComponent(child2)}
      </div>
    `;
  },
});

// import { html } from "../../packages/reona2/src/core/html";
// import { component } from "../../packages/reona2/src/core/component";

// export default component<
//   {},
//   { value: number; },
//   { trigger: () => void; },
//   { globalState: number; double: number; }
// >({
//   name: "child1",

//   data() {
//     return {
//       value: 4,
//     };
//   },

//   computed: {
//     double() {
//       return this.value * 2;
//     }
//   },

//   methods: {
//     trigger() {
//       this.value += 1;
//     },
//   },

//   template() {
//     return html`
//       <div>
//         <button type="button" @click=${this.trigger}>trigger</button>
//         <div>computed: ${this.double}</div>
//       </div>
//     `;
//   },
// });
