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
/* eslint-disable @typescript-eslint/interface-name-prefix, @typescript-eslint/no-empty-interface */

import { instance as globalContainer } from "../dependency-container.ts";

import { assertEquals } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

function before() {
  globalContainer.reset();
}

testWithBeforeAfter({
  name:
    "[child_container] child container resolves even when parent doesn't have registration",
  fn(): void {
    interface IFoo {}
    class Foo implements IFoo {}

    const container = globalContainer.createChildContainer();
    container.register("IFoo", { useClass: Foo });

    const myFoo = container.resolve<Foo>("IFoo");

    assertEquals(myFoo instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[child_container] child container resolves using parent's registration when child container doesn't have registration",
  fn(): void {
    interface IFoo {}
    class Foo implements IFoo {}

    globalContainer.register("IFoo", { useClass: Foo });
    const container = globalContainer.createChildContainer();

    const myFoo = container.resolve<Foo>("IFoo");

    assertEquals(myFoo instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[child_container] child container resolves all even when parent doesn't have registration",
  fn(): void {
    interface IFoo {}
    class Foo implements IFoo {}

    const container = globalContainer.createChildContainer();
    container.register("IFoo", { useClass: Foo });

    const myFoo = container.resolveAll<IFoo>("IFoo");

    assertEquals(Array.isArray(myFoo), true);
    assertEquals(myFoo.length, 1);
    assertEquals(myFoo[0] instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[child_container] child container resolves all using parent's registration when child container doesn't have registration",
  fn(): void {
    interface IFoo {}
    class Foo implements IFoo {}

    globalContainer.register("IFoo", { useClass: Foo });
    const container = globalContainer.createChildContainer();

    const myFoo = container.resolveAll<IFoo>("IFoo");

    assertEquals(Array.isArray(myFoo), true);
    assertEquals(myFoo.length, 1);
    assertEquals(myFoo[0] instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name: "[child_container] isRegistered check parent containers recursively",
  fn(): void {
    class A {}

    globalContainer.registerType(A, A);
    const child = globalContainer.createChildContainer();

    assertEquals(globalContainer.isRegistered(A), true);
    assertEquals(child.isRegistered(A), false);
    assertEquals(child.isRegistered(A, true), true);
  },
}, { before });
