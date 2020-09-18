import { instance as globalContainer } from "../dependency-container.ts";
import { A03 } from "./fixtures/03-test-case-A03-lazy-injects-B03-interface.ts";
import { B03 } from "./fixtures/03-test-case-B03-lazy-injects-A03-interface.ts";

import { assertEquals } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

testWithBeforeAfter({
  name:
    "[inject-lazy-interfaces] lazy creation with proxies allow circular dependencies using interfaces",
  fn(): void {
    const a = globalContainer.resolve(A03);
    const b = globalContainer.resolve(B03);
    assertEquals(a instanceof A03, true);
    assertEquals(a.b instanceof B03, true);
    assertEquals(b.a instanceof A03, true);
    assertEquals(a.b.name, "B03");
  },
}, {});
