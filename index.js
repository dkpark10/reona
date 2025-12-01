import { render } from "./src/core/render.js";
import { counter } from "./src/components/counter.js";

render(document.getElementById('app'), counter());