import { rootRender } from "@/core/renderer";
import Counter from "@/components/counter";

rootRender(document.getElementById("root")!, Counter, { foo: 123 });
