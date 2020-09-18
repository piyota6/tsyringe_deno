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
