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
import type { constructor, Lifecycle } from "../types.ts";
import { injectable } from "./injectable.ts";
import { instance as globalContainer } from "../dependency-container.ts";
import type { InjectionToken } from "../providers.ts";

/**
 * Class decorator factory that registers the class as a scoped dependency within
 * the global container.
 *
 * @return The class decorator
 */
export function scoped<T>(
  lifecycle: Lifecycle.ContainerScoped | Lifecycle.ResolutionScoped,
  token?: InjectionToken<T>,
): (target: constructor<T>) => void {
  return function (target: constructor<T>): void {
    injectable()(target);
    globalContainer.register(token || target, target, {
      lifecycle,
    });
  };
}
