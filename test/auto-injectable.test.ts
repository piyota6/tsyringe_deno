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
import { autoInjectable, injectable, singleton } from "../decorators.ts";
import { instance as globalContainer } from "../dependency-container.ts";
import { injectAll } from "../decorators/inject-all.ts";

import { assertEquals, assertThrows } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

function after() {
  globalContainer.reset();
}

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable allows for injection to be performed without using .resolve()",
  fn(): void {
    class Bar {}
    @autoInjectable()
    class Foo {
      constructor(public myBar?: Bar) {}
    }

    const myFoo = new Foo();

    assertEquals(myFoo.myBar instanceof Bar, true);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable allows for parameters to be specified manually",
  fn(): void {
    class Bar {}
    @autoInjectable()
    class Foo {
      constructor(public myBar?: Bar) {}
    }

    const myBar = new Bar();
    const myFoo = new Foo(myBar);

    assertEquals(myFoo.myBar, myBar);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable injects parameters beyond those specified manually",
  fn(): void {
    class Bar {}
    class FooBar {}
    @autoInjectable()
    class Foo {
      constructor(public myFooBar: FooBar, public myBar?: Bar) {}
    }

    const myFooBar = new FooBar();
    const myFoo = new Foo(myFooBar);

    assertEquals(myFoo.myFooBar, myFooBar);
    assertEquals(myFoo.myBar instanceof Bar, true);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable works when the @autoInjectable is a polymorphic ancestor",
  fn(): void {
    class Foo {
      constructor() {}
    }

    @autoInjectable()
    class Ancestor {
      constructor(public myFoo?: Foo) {}
    }

    class Child extends Ancestor {
      constructor() {
        super();
      }
    }

    const instance = new Child();

    assertEquals(instance.myFoo instanceof Foo, true);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable classes keep behavior from their ancestor's constructors",
  fn(): void {
    const a = 5;
    const b = 4;
    class Foo {
      constructor() {}
    }

    @autoInjectable()
    class Ancestor {
      public a: number;
      constructor(public myFoo?: Foo) {
        this.a = a;
      }
    }

    class Child extends Ancestor {
      public b: number;
      constructor() {
        super();

        this.b = b;
      }
    }

    const instance = new Child();

    assertEquals(instance.a, a);
    assertEquals(instance.b, b);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable classes resolve their @injectable dependencies",
  fn(): void {
    class Foo {}
    @injectable()
    class Bar {
      constructor(public myFoo: Foo) {}
    }
    @autoInjectable()
    class FooBar {
      constructor(public myBar?: Bar) {}
    }

    const myFooBar = new FooBar();

    assertEquals(myFooBar.myBar!.myFoo instanceof Foo, true);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable throws a clear error if a dependency can't be resolved.",
  fn(): void {
    interface Bar {
      someval: string;
    }
    @autoInjectable()
    class Foo {
      constructor(public myBar?: Bar) {}
    }
    assertThrows(
      () => new Foo(),
      Error,
      'Cannot inject the dependency "myBar" at position #0 of "Foo" constructor',
    );
  },
}, { after });

testWithBeforeAfter({
  name: "[autoInjectable] @autoInjectable works with @singleton",
  fn(): void {
    class Bar {}

    @singleton()
    @autoInjectable()
    class Foo {
      constructor(public bar: Bar) {}
    }

    const instance1 = globalContainer.resolve(Foo);
    const instance2 = globalContainer.resolve(Foo);

    assertEquals(instance1, instance2);
    assertEquals(instance1.bar, instance2.bar);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable resolves multiple registered dependencies",
  fn(): void {
    interface Bar {
      str: string;
    }

    @injectable()
    class FooBar implements Bar {
      str = "";
    }

    globalContainer.register<Bar>("Bar", { useClass: FooBar });

    @autoInjectable()
    class Foo {
      constructor(@injectAll("Bar") public bar?: Bar[]) {}
    }

    const foo = new Foo();
    assertEquals(Array.isArray(foo.bar), true);
    assertEquals(foo.bar!.length, 1);
    assertEquals(foo.bar![0] instanceof FooBar, true);
  },
}, { after });

testWithBeforeAfter({
  name:
    "[autoInjectable] @autoInjectable resolves multiple transient dependencies",
  fn(): void {
    class Foo {}

    @autoInjectable()
    class Bar {
      constructor(@injectAll(Foo) public foo?: Foo[]) {}
    }

    const bar = new Bar();
    assertEquals(Array.isArray(bar.foo), true);
    assertEquals(bar.foo!.length, 1);
    assertEquals(bar.foo![0] instanceof Foo, true);
  },
}, { after });
