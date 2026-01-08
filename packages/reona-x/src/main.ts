import { rootRender } from "@/core/temp";
import Counter from "@/components/counter";

rootRender(document.getElementById("root")!, Counter, { value: 123 });