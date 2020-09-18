export async function testWithBeforeAfter(
  t: Deno.TestDefinition,
  beforeAfter: { before?: Function; after?: Function },
) {
  async function wrapped() {
    if (beforeAfter.before) {
      await beforeAfter.before();
    }
    try {
      await t.fn();
    } finally {
      if (beforeAfter.after) {
        await beforeAfter.after();
      }
    }
  }
  Deno.test({ name: t.name, fn: wrapped });
}
