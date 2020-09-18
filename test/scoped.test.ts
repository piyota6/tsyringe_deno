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
import { injectable } from "../decorators/injectable.ts";
import { instance as globalContainer } from "../dependency-container.ts";
import { Lifecycle } from "../types/lifecycle.ts";
import { scoped } from "../decorators/scoped.ts";

import {
  assertEquals,
  assertNotStrictEquals,
} from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

function after() {
  globalContainer.reset();
}

testWithBeforeAfter({
  name:
    "[Scoped registrations/ResolutionScoped] uses the same instance during the same resolution chain",
  fn(): void {
    class X {}

    @injectable()
    class B {
      constructor(public x: X) {}
    }

    @injectable()
    class C {
      constructor(public x: X) {}
    }

    @injectable()
    class A {
      constructor(public b: B, public c: C) {}
    }

    globalContainer.register(
      X,
      { useClass: X },
      { lifecycle: Lifecycle.ResolutionScoped },
    );
    const a = globalContainer.resolve(A);

    assertEquals(a.b.x, a.c.x);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ResolutionScoped] uses different instances for difference resolution chains",
  fn(): void {
    class X {}

    @injectable()
    class B {
      constructor(public x: X) {}
    }

    @injectable()
    class A {
      constructor(public b: B) {}
    }

    globalContainer.register(
      X,
      { useClass: X },
      { lifecycle: Lifecycle.ResolutionScoped },
    );
    const a = globalContainer.resolve(A);
    const b = globalContainer.resolve(A);

    assertNotStrictEquals(a.b.x, b.b.x);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] creates a new instanceof requested service within a scope using class provider",
  fn(): void {
    class Foo {}

    debugger;
    globalContainer.register(Foo, Foo, {
      lifecycle: Lifecycle.ContainerScoped,
    });

    const foo1 = globalContainer.resolve(Foo);

    assertEquals(foo1 instanceof Foo, true);

    const scope = globalContainer.createChildContainer();
    const foo2 = scope.resolve(Foo);
    const foo3 = scope.resolve(Foo);

    assertEquals(foo2 instanceof Foo, true);
    assertEquals(foo3 instanceof Foo, true);
    assertNotStrictEquals(foo1, foo2);
    assertEquals(foo2, foo3);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] creates a new instanceof requested service within a scope using token provider",
  fn(): void {
    interface IBar {
      void: string;
    }
    class Foo implements IBar {
      void = "";
    }

    globalContainer.register("IBar", Foo, {
      lifecycle: Lifecycle.ContainerScoped,
    });
    globalContainer.register(
      Foo,
      { useToken: "IBar" },
      {
        lifecycle: Lifecycle.Transient,
      },
    );

    const foo1 = globalContainer.resolve(Foo);

    assertEquals(foo1 instanceof Foo, true);

    const scope = globalContainer.createChildContainer();
    const foo2 = scope.resolve(Foo);
    const foo3 = scope.resolve(Foo);

    assertEquals(foo2 instanceof Foo, true);
    assertEquals(foo3 instanceof Foo, true);
    assertNotStrictEquals(foo1, foo2);
    assertEquals(foo2, foo3);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] should not create a new instanceof requested singleton service",
  fn(): void {
    class Bar {}

    globalContainer.registerSingleton(Bar, Bar);

    const bar1 = globalContainer.resolve(Bar);

    assertEquals(bar1 instanceof Bar, true);

    const scope = globalContainer.createChildContainer();
    const bar2 = scope.resolve(Bar);

    assertEquals(bar2 instanceof Bar, true);
    assertEquals(bar1, bar2);
  },
}, { after });
testWithBeforeAfter({
  name: "[Scoped registrations/ContainerScoped] allows multiple scope levels",
  fn(): void {
    class Bar {}

    globalContainer.register(Bar, Bar, {
      lifecycle: Lifecycle.ContainerScoped,
    });
    const bar = globalContainer.resolve(Bar);

    const scope1 = globalContainer.createChildContainer();
    const bar1 = scope1.resolve(Bar);

    const scope2 = scope1.createChildContainer();
    const bar2 = scope2.resolve(Bar);

    assertNotStrictEquals(bar, bar1);
    assertNotStrictEquals(bar, bar2);
    assertNotStrictEquals(bar1, bar2);

    assertEquals(bar, globalContainer.resolve(Bar));
    assertEquals(bar1, scope1.resolve(Bar));
    assertEquals(bar2, scope2.resolve(Bar));
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] @scoped decorator registers class as scoped",
  fn(): void {
    @scoped(Lifecycle.ContainerScoped)
    class Foo {}

    const foo1 = globalContainer.resolve(Foo);

    assertEquals(foo1 instanceof Foo, true);

    const scope = globalContainer.createChildContainer();
    const foo2 = scope.resolve(Foo);
    const foo3 = scope.resolve(Foo);

    assertEquals(foo2 instanceof Foo, true);
    assertEquals(foo3 instanceof Foo, true);
    assertNotStrictEquals(foo1, foo2);
    assertEquals(foo2, foo3);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] @scoped decorator registers class as scoped using custom token",
  fn(): void {
    @scoped(Lifecycle.ContainerScoped, "Foo")
    class Foo {}

    const foo1 = globalContainer.resolve("Foo");

    assertEquals(foo1 instanceof Foo, true);

    const scope = globalContainer.createChildContainer();
    const foo2 = scope.resolve("Foo");
    const foo3 = scope.resolve("Foo");

    assertEquals(foo2 instanceof Foo, true);
    assertEquals(foo3 instanceof Foo, true);
    assertNotStrictEquals(foo1, foo2);
    assertEquals(foo2, foo3);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[Scoped registrations/ContainerScoped] resolve all resolves scoped dependencies properly",
  fn(): void {
    interface Foo {
      test: string;
    }

    class FooBar implements Foo {
      test = "bar";
    }

    class FooQux implements Foo {
      test = "qux";
    }

    globalContainer.registerSingleton<Foo>("Foo", FooBar);
    globalContainer.register<Foo>("Foo", FooQux, {
      lifecycle: Lifecycle.ContainerScoped,
    });
    const foo1 = globalContainer.resolveAll<Foo>("Foo");
    const foo2 = globalContainer.resolveAll<Foo>("Foo");

    assertEquals(foo1[0], foo2[0]);
    assertEquals(foo1[1], foo2[1]);

    const scope = globalContainer.createChildContainer();
    const foo3 = scope.resolveAll<Foo>("Foo");
    const foo4 = scope.resolveAll<Foo>("Foo");

    assertEquals(foo3[0], foo4[0]);
    assertEquals(foo3[1], foo4[1]);

    assertEquals(foo3[0], foo1[0]);
    assertEquals(foo4[0], foo2[0]);

    assertNotStrictEquals(foo3[1], foo1[1]);
    assertNotStrictEquals(foo4[1], foo2[1]);
  },
}, { after });
