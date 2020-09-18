import { Registry } from "../registry.ts";
import type { Registration } from "../dependency-container.ts";
import { Lifecycle } from "../types/lifecycle.ts";

import { assertEquals, assertStrictEquals } from "../deps_dev.ts";
import { testWithBeforeAfter } from "./utils/testUtils.ts";

let registry: Registry;
function before() {
  registry = new Registry();
}

testWithBeforeAfter({
  name: "[registry] getAll returns all registrations of a given key",
  fn(): void {
    const registration1: Registration = {
      options: { lifecycle: Lifecycle.Singleton },
      provider: { useValue: "provider" },
    };
    const registration2: Registration = {
      options: { lifecycle: Lifecycle.Singleton },
      provider: { useValue: "provider" },
    };

    registry.set("Foo", registration1);
    registry.set("Foo", registration2);

    assertEquals(registry.has("Foo"), true);

    const all = registry.getAll("Foo");
    assertEquals(Array.isArray(all), true);
    assertEquals(all.length, 2);
    assertStrictEquals(all[0], registration1);
    assertStrictEquals(all[1], registration2);
  },
}, { before });

testWithBeforeAfter({
  name: "[registry] get returns the last registratio",
  fn(): void {
  },
}, { before });

testWithBeforeAfter({
  name: "[registry] ",
  fn(): void {
    const registration1: Registration = {
      options: { lifecycle: Lifecycle.Singleton },
      provider: { useValue: "provider" },
    };
    const registration2: Registration = {
      options: { lifecycle: Lifecycle.Singleton },
      provider: { useValue: "provider" },
    };

    registry.set("Bar", registration1);
    registry.set("Bar", registration2);

    assertEquals(registry.has("Bar"), true);
    assertStrictEquals(registry.get("Bar"), registration2);
  },
}, { before });

testWithBeforeAfter({
  name: "[registry] get returns null when there is no registration",
  fn(): void {
    assertEquals(registry.has("FooBar"), false);
    assertEquals(registry.get("FooBar"), null);
  },
}, { before });

testWithBeforeAfter({
  name: "[registry] clear removes all registrations",
  fn(): void {
    const registration: Registration = {
      options: { lifecycle: Lifecycle.Singleton },
      provider: { useValue: "provider" },
    };

    registry.set("Foo", registration);
    assertEquals(registry.has("Foo"), true);

    registry.clear();
    assertEquals(registry.has("Foo"), false);
  },
}, { before });

testWithBeforeAfter({
  name: "[registry] setAll replaces everything with new value",
  fn(): void {
    const registration: Registration = {
      options: { lifecycle: Lifecycle.Transient },
      provider: { useValue: "provider" },
    };

    assertEquals(registry.has("Foo"), false);

    registry.set("Foo", registration);
    const fooArray = registry.getAll("Foo");
    registry.setAll("Foo", [registration]);

    assertEquals(fooArray === registry.getAll("Foo"), false);
  },
}, { before });
