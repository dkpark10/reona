import { rootRender } from "./core/component";
import Counter from "../../../fixture/reona-x";

rootRender(document.getElementById("root")!, Counter, { value: 123 });