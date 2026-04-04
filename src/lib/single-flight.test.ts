import test from 'node:test';
import assert from 'node:assert/strict';
import { createSingleFlight } from './single-flight';

test('createSingleFlight deduplicates concurrent calls with the same key', async () => {
  let callCount = 0;
  const singleFlight = createSingleFlight<string>();

  const task = () =>
    singleFlight.run('science:1', async () => {
      callCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 'done';
    });

  const [first, second, third] = await Promise.all([task(), task(), task()]);

  assert.equal(callCount, 1);
  assert.equal(first, 'done');
  assert.equal(second, 'done');
  assert.equal(third, 'done');
});

test('createSingleFlight allows a new call after the first one settles', async () => {
  let callCount = 0;
  const singleFlight = createSingleFlight<number>();

  const first = await singleFlight.run('science:1', async () => {
    callCount += 1;
    return 1;
  });

  const second = await singleFlight.run('science:1', async () => {
    callCount += 1;
    return 2;
  });

  assert.equal(callCount, 2);
  assert.equal(first, 1);
  assert.equal(second, 2);
});
