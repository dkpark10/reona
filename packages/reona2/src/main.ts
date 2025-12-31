import { rootRender } from "@/core/renderer";
import Counter from "@/components/counter";

rootRender(document.getElementById("root")!, Counter, {
  props: {
    foo: 123,
  },
});
