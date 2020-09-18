/* eslint-disable @typescript-eslint/interface-name-prefix */

import { inject, injectable, registry, singleton } from "../decorators.ts";
import {
  instanceCachingFactory,
  predicateAwareClassFactory,
} from "../factories.ts";
import type { DependencyContainer } from "../types.ts";
import { instance as globalContainer } from "../dependency-container.ts";
import { injectAll } from "../decorators/inject-all.ts";
import { Lifecycle } from "../types/lifecycle.ts";
import type { ValueProvider } from "../providers.ts";

import {
  assertEquals,
  assertNotStrictEquals,
  assertThrows,
} from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

interface IBar {
  value: string;
}

function before() {
  globalContainer.reset();
}

// --- registerSingleton() ---

testWithBeforeAfter({
  name: "[global_container] a singleton registration can be redirected",
  fn(): void {
    @singleton()
    class MyService {}

    class MyServiceMock {}

    @injectable()
    class MyClass {
      constructor(public myService: MyService) {}
    }

    globalContainer.registerSingleton(MyService, MyServiceMock);
    const myClass = globalContainer.resolve(MyClass);

    assertEquals(myClass.myService instanceof MyServiceMock, true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] fails to resolve unregistered dependency by name",
  fn(): void {
    assertThrows(() => globalContainer.resolve("NotRegistered"));
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] allows arrays to be registered by value provider",
  fn(): void {
    class Bar {}

    const value = [new Bar()];
    globalContainer.register<Bar[]>("BarArray", { useValue: value });

    const barArray = globalContainer.resolve<Bar[]>("BarArray");
    assertEquals(Array.isArray(barArray), true);
    assertEquals(value, barArray);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] allows arrays to be registered by factory provider",
  fn(): void {
    class Bar {}

    globalContainer.register<Bar>(Bar, { useClass: Bar });
    globalContainer.register<Bar[]>("BarArray", {
      useFactory: (container): Bar[] => {
        return [container.resolve(Bar)];
      },
    });

    const barArray = globalContainer.resolve<Bar[]>("BarArray");
    assertEquals(Array.isArray(barArray), true);
    assertEquals(barArray.length, 1);
    assertEquals(barArray[0] instanceof Bar, true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] resolves transient instances when not registered",
  fn(): void {
    class Bar {}

    const myBar = globalContainer.resolve(Bar);
    const myBar2 = globalContainer.resolve(Bar);

    assertEquals(myBar instanceof Bar, true);
    assertEquals(myBar2 instanceof Bar, true);
    assertNotStrictEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves a transient instance when registered by class provider",
  fn(): void {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });

    const myBar = globalContainer.resolve<Bar>("Bar");
    const myBar2 = globalContainer.resolve<Bar>("Bar");

    assertEquals(myBar instanceof Bar, true);
    assertEquals(myBar2 instanceof Bar, true);
    assertNotStrictEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves a singleton instance when class provider registered as singleton",
  fn(): void {
    class Bar {}
    globalContainer.register(
      "Bar",
      { useClass: Bar },
      { lifecycle: Lifecycle.Singleton },
    );

    const myBar = globalContainer.resolve<Bar>("Bar");
    const myBar2 = globalContainer.resolve<Bar>("Bar");

    assertEquals(myBar instanceof Bar, true);
    assertEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves a transient instance when using token alias",
  fn(): void {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });
    globalContainer.register("BarAlias", { useToken: "Bar" });

    const myBar = globalContainer.resolve<Bar>("BarAlias");
    const myBar2 = globalContainer.resolve<Bar>("BarAlias");

    assertEquals(myBar instanceof Bar, true);
    assertNotStrictEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves a singleton instance when token alias registered as singleton",
  fn(): void {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });
    globalContainer.register(
      "SingletonBar",
      { useToken: "Bar" },
      { lifecycle: Lifecycle.Singleton },
    );

    const myBar = globalContainer.resolve<Bar>("SingletonBar");
    const myBar2 = globalContainer.resolve<Bar>("SingletonBar");

    assertEquals(myBar instanceof Bar, true);
    assertEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves same instance when registerInstance() is used with a class",
  fn(): void {
    class Bar {}
    const instance = new Bar();
    globalContainer.registerInstance(Bar, instance);

    assertEquals(globalContainer.resolve(Bar), instance);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves same instance when registerInstance() is used with a name",
  fn(): void {
    class Bar {}
    const instance = new Bar();
    globalContainer.registerInstance("Test", instance);

    assertEquals(globalContainer.resolve("Test"), instance);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registerType() allows for classes to be swapped",
  fn(): void {
    class Bar {}
    class Foo {}
    globalContainer.registerType(Bar, Foo);

    assertEquals(globalContainer.resolve<Foo>(Bar) instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] registerType() allows for names to be registered for a given type",
  fn(): void {
    class Bar {}
    globalContainer.registerType("CoolName", Bar);

    assertEquals(globalContainer.resolve<Bar>("CoolName") instanceof Bar, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] executes a registered factory each time resolve is called",
  fn(): void {
    const factoryMock = function () {
      var a = -1;
      return function () {
        a++;
        return a;
      };
    }();
    globalContainer.register("Test", { useFactory: factoryMock });

    globalContainer.resolve("Test");
    globalContainer.resolve("Test");

    assertEquals(factoryMock(), 2);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves to factory result each time resolve is called",
  fn(): void {
    const factoryMock = function () {
      var a = 0;
      return function () {
        a++;
        return a;
      };
    }();
    globalContainer.register("Test", { useFactory: factoryMock });
    const value1 = 1;
    const value2 = 2;

    const result1 = globalContainer.resolve("Test");
    const result2 = globalContainer.resolve("Test");

    assertEquals(result1, value1);
    assertEquals(result2, value2);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] resolves anonymous classes separately",
  fn(): void {
    const ctor1 = (() => class {})();
    const ctor2 = (() => class {})();

    globalContainer.registerInstance(ctor1, new ctor1());
    globalContainer.registerInstance(ctor2, new ctor2());

    assertEquals(globalContainer.resolve(ctor1) instanceof ctor1, true);
    assertEquals(globalContainer.resolve(ctor2) instanceof ctor2, true);
  },
}, { before });

// --- resolveAll() ---

testWithBeforeAfter({
  name:
    "[global_container] fails to resolveAll unregistered dependency by name",
  fn(): void {
    assertThrows(() => globalContainer.resolveAll("NotRegistered"));
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves an array of transient instances bound to a single interface",
  fn(): void {
    interface FooInterface {
      bar: string;
    }

    class FooOne implements FooInterface {
      public bar = "foo1";
    }

    class FooTwo implements FooInterface {
      public bar = "foo2";
    }

    globalContainer.register<FooInterface>(
      "FooInterface",
      { useClass: FooOne },
    );
    globalContainer.register<FooInterface>(
      "FooInterface",
      { useClass: FooTwo },
    );

    const fooArray = globalContainer.resolveAll<FooInterface>("FooInterface");
    assertEquals(Array.isArray(fooArray), true);
    assertEquals(fooArray[0] instanceof FooOne, true);
    assertEquals(fooArray[1] instanceof FooTwo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] resolves all transient instances when not registered",
  fn(): void {
    class Foo {}

    const foo1 = globalContainer.resolveAll<Foo>(Foo);
    const foo2 = globalContainer.resolveAll<Foo>(Foo);

    assertEquals(Array.isArray(foo1), true);
    assertEquals(Array.isArray(foo2), true);
    assertEquals(foo1[0] instanceof Foo, true);
    assertEquals(foo2[0] instanceof Foo, true);
    assertNotStrictEquals(foo1[0], foo2[0]);
  },
}, { before });

// --- isRegistered() ---

testWithBeforeAfter({
  name: "[global_container] returns true for a registered singleton class",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    globalContainer.registerSingleton(Foo);

    assertEquals(globalContainer.isRegistered(Foo), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] returns true for a registered class provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    globalContainer.register(Foo, { useClass: Foo });

    assertEquals(globalContainer.isRegistered(Foo), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] returns true for a registered value provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    globalContainer.register(Foo, { useValue: {} } as ValueProvider<any>);

    assertEquals(globalContainer.isRegistered(Foo), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] returns true for a registered token provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    globalContainer.register(Foo, { useToken: "Bar" });

    assertEquals(globalContainer.isRegistered(Foo), true);
  },
}, { before });

// --- clearInstances() ---

testWithBeforeAfter({
  name: "[global_container] ",
  fn(): void {
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] clears ValueProvider registrations",
  fn(): void {
    class Foo {}
    const instance1 = new Foo();
    globalContainer.registerInstance("Test", instance1);

    assertEquals(globalContainer.resolve("Test") instanceof Foo, true);

    globalContainer.clearInstances();

    assertThrows(() => globalContainer.resolve("Test"));
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] clears cached instances from container.resolve() calls",
  fn(): void {
    @singleton()
    class Foo {}
    const instance1 = globalContainer.resolve(Foo);

    globalContainer.clearInstances();

    // Foo should still be registered as singleton
    const instance2 = globalContainer.resolve(Foo);
    const instance3 = globalContainer.resolve(Foo);

    assertNotStrictEquals(instance1, instance2);
    assertEquals(instance2, instance3);
    assertEquals(instance3 instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] @injectable resolves when not using DI",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    const myValue = "test";
    const myBar = new Bar();
    myBar.value = myValue;

    const myFoo = new Foo(myBar);

    assertEquals(myFoo.myBar.value, myValue);
  },
}, { before });

// --- @injectable ---

testWithBeforeAfter({
  name: "[global_container] @injectable resolves when using DI",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    const myFoo = globalContainer.resolve(Foo);

    assertEquals(myFoo.myBar.value, "");
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] @injectable resolves nested dependencies when using DI",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }
    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    @injectable()
    class FooBar {
      constructor(public myFoo: Foo) {}
    }
    const myFooBar = globalContainer.resolve(FooBar);

    assertEquals(myFooBar.myFoo.myBar.value, "");
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] @injectable preserves static members",
  fn(): void {
    const value = "foobar";

    @injectable()
    class MyStatic {
      public static testVal = value;

      public static testFunc(): string {
        return value;
      }
    }

    assertEquals(MyStatic.testFunc(), value);
    assertEquals(MyStatic.testVal, value);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] @injectable handles optional params",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }
    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    @injectable()
    class MyOptional {
      constructor(public myFoo?: Foo) {}
    }

    const myOptional = globalContainer.resolve(MyOptional);
    assertEquals(myOptional.myFoo instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] @singleton registers class as singleton with the global container",
  fn(): void {
    @singleton()
    class Bar {}

    const myBar = globalContainer.resolve(Bar);
    const myBar2 = globalContainer.resolve(Bar);

    assertEquals(myBar instanceof Bar, true);
    assertEquals(myBar, myBar2);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] dependencies of an @singleton can be resolved",
  fn(): void {
    class Foo {}

    @singleton()
    class Bar {
      constructor(public foo: Foo) {}
    }

    const myBar = globalContainer.resolve(Bar);

    assertEquals(myBar.foo instanceof Foo, true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] passes through the given params",
  fn(): void {
    @injectable()
    class MyViewModel {
      constructor(public a: any, public b: any, public c: any) {}
    }

    const a = {};
    const b = {};
    const c = {};
    const instance = new MyViewModel(a, b, c);

    assertEquals(instance.a, a);
    assertEquals(instance.b, b);
    assertEquals(instance.c, c);
  },
}, { before });

// --- @registry ---

testWithBeforeAfter({
  name: "[global_container] doesn't blow up with empty args",
  fn(): void {
    @registry()
    class RegisteringFoo {}

    // expected not to throw
    new RegisteringFoo();
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by type provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }
    @registry([{ token: Bar, useClass: Bar }])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(Bar), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by class provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }
    const registration = {
      token: "IBar",
      useClass: Bar,
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by value provider",
  fn(): void {
    const registration = {
      token: "IBar",
      useValue: {},
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by token provider",
  fn(): void {
    const registration = {
      token: "IBar",
      useToken: "IFoo",
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by factory provider",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    const registration = {
      token: "IBar",
      useFactory: (globalContainer: DependencyContainer) =>
        globalContainer.resolve(Bar),
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers mixed types",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }
    @injectable()
    class Foo {
      constructor(public myBar: Bar) {}
    }
    const registration = {
      token: "IBar",
      useClass: Bar,
    };

    @registry([registration, { token: Foo, useClass: Foo }])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
    assertEquals(globalContainer.isRegistered(Foo), true);
  },
}, { before });

testWithBeforeAfter({
  name: "[global_container] registers by symbol token provider",
  fn(): void {
    const registration = {
      token: Symbol("obj1"),
      useValue: {},
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    assertEquals(globalContainer.isRegistered(registration.token), true);
    assertEquals(
      globalContainer.resolve(registration.token),
      registration.useValue,
    );
  },
}, { before });

// --- @inject ---

testWithBeforeAfter({
  name:
    "[global_container] allows interfaces to be resolved from the constructor with injection token",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    @registry([{ token: Bar, useClass: Bar }])
    class FooWithInterface {
      constructor(@inject(Bar) public myBar: IBar) {}
    }

    const myFoo = globalContainer.resolve(FooWithInterface);

    assertEquals(myFoo.myBar instanceof Bar, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] allows interfaces to be resolved from the constructor with just a name",
  fn(): void {
    @injectable()
    class Bar implements IBar {
      public value = "";
    }

    @injectable()
    @registry([
      {
        token: "IBar",
        useClass: Bar,
      },
    ])
    class FooWithInterface {
      constructor(@inject("IBar") public myBar: IBar) {}
    }

    const myFoo = globalContainer.resolve(FooWithInterface);

    assertEquals(myFoo.myBar instanceof Bar, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] allows explicit array dependencies to be resolved by inject decorator",
  fn(): void {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@inject("FooArray") public foo: Foo[]) {}
    }

    const fooArray = [new Foo()];
    globalContainer.register<Foo[]>("FooArray", { useValue: fooArray });
    globalContainer.register<Bar>(Bar, { useClass: Bar });

    const bar = globalContainer.resolve<Bar>(Bar);
    assertEquals(bar.foo, fooArray);
  },
}, { before });

// --- @injectAll ---

testWithBeforeAfter({
  name:
    "[global_container] injects all dependencies bound to a given interface",
  fn(): void {
    interface Foo {
      str: string;
    }

    class FooImpl1 implements Foo {
      public str = "foo1";
    }

    class FooImpl2 implements Foo {
      public str = "foo2";
    }

    @injectable()
    class Bar {
      constructor(@injectAll("Foo") public foo: Foo[]) {}
    }

    globalContainer.register<Foo>("Foo", { useClass: FooImpl1 });
    globalContainer.register<Foo>("Foo", { useClass: FooImpl2 });

    const bar = globalContainer.resolve<Bar>(Bar);
    assertEquals(Array.isArray(bar.foo), true);
    assertEquals(bar.foo.length, 2);
    assertEquals(bar.foo[0] instanceof FooImpl1, true);
    assertEquals(bar.foo[1] instanceof FooImpl2, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] allows array dependencies to be resolved if a single instance is in the container",
  fn(): void {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@injectAll(Foo) public foo: Foo[]) {}
    }
    globalContainer.register<Foo>(Foo, { useClass: Foo });
    globalContainer.register<Bar>(Bar, { useClass: Bar });

    const bar = globalContainer.resolve<Bar>(Bar);
    assertEquals(bar.foo.length, 1);
  },
}, { before });

// --- factories ---

testWithBeforeAfter({
  name:
    "[global_container] instanceCachingFactory caches the returned instance",
  fn(): void {
    const factory = instanceCachingFactory(() => {});

    assertEquals(factory(globalContainer), factory(globalContainer));
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] instanceCachingFactory caches the returned instance even when there is branching logic in the factory",
  fn(): void {
    const instanceA = {};
    const instanceB = {};
    let useA = true;

    const factory = instanceCachingFactory(() => (useA
      ? instanceA
      : instanceB)
    );

    assertEquals(factory(globalContainer), instanceA);
    useA = false;
    assertEquals(factory(globalContainer), instanceA);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] predicateAwareClassFactory correctly switches the returned instance with caching on",
  fn(): void {
    class A {}
    class B {}
    let useA = true;
    const factory = predicateAwareClassFactory(() => useA, A, B);

    assertEquals(factory(globalContainer) instanceof A, true);
    useA = false;
    assertEquals(factory(globalContainer) instanceof B, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] predicateAwareClassFactory returns the same instance each call with caching on",
  fn(): void {
    class A {}
    class B {}
    const factory = predicateAwareClassFactory(() => true, A, B);

    assertEquals(factory(globalContainer), factory(globalContainer));
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] predicateAwareClassFactory correctly switches the returned instance with caching off",
  fn(): void {
    class A {}
    class B {}
    let useA = true;
    const factory = predicateAwareClassFactory(() => useA, A, B, false);

    assertEquals(factory(globalContainer) instanceof A, true);
    useA = false;
    assertEquals(factory(globalContainer) instanceof B, true);
  },
}, { before });

testWithBeforeAfter({
  name:
    "[global_container] predicateAwareClassFactory returns new instances each call with caching off",
  fn(): void {
    class A {}
    class B {}
    const factory = predicateAwareClassFactory(() => true, A, B, false);

    assertNotStrictEquals(factory(globalContainer), factory(globalContainer));
  },
}, { before });
