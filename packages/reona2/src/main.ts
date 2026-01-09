import { rootRender } from "./core/runtime-dom";
// import counter from "../../../fixture/counter";
// import store from "../../../fixture/store";
// import nested from "../../../fixture/nested";
// import condition from "../../../fixture/condition";
import optimize from "../../../fixture/render-optimize";

// rootRender(document.getElementById("root")!, counter);
// rootRender(document.getElementById("root")!, condition);
// rootRender(document.getElementById("root")!, store);
// rootRender(document.getElementById("root")!, nested);
rootRender(document.getElementById("root")!, optimize);
