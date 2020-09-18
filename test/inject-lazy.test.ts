import { delay, DelayedConstructor } from "../lazy-helpers.ts";
//import { instance as globalContainer } from "../dependency-container.ts";
//import { A02 } from "./fixtures/02-test-case-A02-lazy-injects-B02.ts";
//import { B02 } from "./fixtures/02-test-case-B02-lazy-injects-A02.ts";

import { assertEquals } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

testWithBeforeAfter({
  name: "[inject-lazy] DelayedConstructor delays creation until first usage",
  fn(): void {
    let created = false;
    class Foo {
      sum(...args: number[]): number {
        return args.reduce((x, y) => x + y, 0);
      }
      constructor() {
        created = true;
      }
    }
    const delayedConstructor = delay(() => Foo);
    assertEquals(delayedConstructor instanceof DelayedConstructor, true);
    const foo: Foo = delayedConstructor.createProxy((Target) => new Target());
    assertEquals(created, false);
    assertEquals(foo instanceof Foo, true);
    assertEquals(created, true);
    assertEquals(foo.sum(1, 2, 3, 4), 10);
  },
}, {});
/*
testWithBeforeAfter({
  name: "[inject-lazy] Lazy creation with proxies allow circular dependencies",
  fn(): void {
    const a = globalContainer.resolve(A02);
    const b = globalContainer.resolve(B02);
    b.prop["defined"] = true;
    assertEquals(a instanceof A02, true);
    assertEquals(a.b instanceof B02, true);
    assertEquals(b.a instanceof A02, true);
    assertEquals(a.b.prop["defined"], true);
    assertEquals(a.b.name, "B02");
  },
}, {});
*/
