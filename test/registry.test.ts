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
