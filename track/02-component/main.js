import { rootRender } from "./src/core/runtime-dom";
import App from "./src/components/parent";

rootRender(document.getElementById('root'), App);