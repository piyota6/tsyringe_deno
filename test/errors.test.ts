import { instance as globalContainer } from "../dependency-container.ts";
import { inject, injectable } from "../decorators.ts";

import { assertThrows } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

function before() {
  globalContainer.reset();
}

testWithBeforeAfter({
  name: "[errors] Error message composition",
  fn(): void {
    class Ok {}

    @injectable()
    class C {
      constructor(public s: any) {}
    }

    @injectable()
    class B {
      constructor(public c: C) {}
    }

    @injectable()
    class A {
      constructor(public d: Ok, public b: B) {}
    }

    assertThrows(
      () => {
        globalContainer.resolve(A);
      },
    );
  },
}, { before });

testWithBeforeAfter({
  name: "[errors] Param position",
  fn(): void {
    @injectable()
    class A {
      constructor(@inject("missing") public j: any) {}
    }

    assertThrows(
      () => {
        globalContainer.resolve(A);
      },
    );
  },
}, { before });
