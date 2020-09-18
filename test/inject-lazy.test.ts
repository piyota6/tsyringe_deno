/*
MIT License

Copyright (c) Microsoft Corporation. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
*/
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
