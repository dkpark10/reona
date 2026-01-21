import { rootRender } from "./src/core/runtime-dom";
import Counter from "./src/components/counter";

rootRender(document.getElementById('root'), Counter);