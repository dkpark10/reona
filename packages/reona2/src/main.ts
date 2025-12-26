import { rootRender } from "@/core/renderer";
import Counter from "@/components/counter";

rootRender(document.getElementById("app")!, Counter, { foo: 123 });
