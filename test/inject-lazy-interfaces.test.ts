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
