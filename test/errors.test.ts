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
