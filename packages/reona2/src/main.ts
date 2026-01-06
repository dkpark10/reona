import { rootRender } from "./core/renderer";
import Counter from "../../../fixture/counter";
import Store from "../../../fixture/store";
import Nested from "../../../fixture/nested";
import Condition from "../../../fixture/condition";

// rootRender(document.getElementById("root")!, Counter);
rootRender(document.getElementById("root")!, Condition);
