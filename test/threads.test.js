const test = require('node:test');
const assert = require('node:assert');
const { handle } = require('../src/threads');

const fresh = () => ({ threads: [], stack: [] });
const echo = (thread, question) => {
  thread.started = true;
  return `[${thread.topic}] ${question}`;
};

test('main thread prompts pass through', () => {
  assert.strictEqual(handle(fresh(), 'hello', echo), null);
});

test('/side opens a thread and asks the topic', () => {
  const state = fresh();
  const reply = handle(state, '/side best icon pack?', echo);
  assert.match(reply, /best icon pack\?\n\n\[best icon pack\?\] best icon pack\?/);
  assert.deepStrictEqual(state.stack, [0]);
});

test('prompts inside a side thread go to it', () => {
  const state = fresh();
  handle(state, '/side icons', echo);
  assert.match(handle(state, 'free ones?', echo), /\[icons\] free ones\?/);
});

test('nesting and /back unwind the stack', () => {
  const state = fresh();
  handle(state, '/side a', echo);
  handle(state, '/side b', echo);
  assert.match(handle(state, '/back', echo), /back to a/);
  assert.match(handle(state, '/back', echo), /back to main thread/);
  assert.strictEqual(handle(state, 'main again', echo), null);
  assert.match(handle(state, '/back', echo), /Already on the main thread/);
});

test('/threads lists and jumps', () => {
  const state = fresh();
  handle(state, '/side a', echo);
  handle(state, '/back', echo);
  assert.match(handle(state, '/threads', echo), /○ 1\. a/);
  handle(state, '/threads 1', echo);
  assert.deepStrictEqual(state.stack, [0]);
  assert.match(handle(state, '/threads 9', echo), /No thread 9/);
});

test('namespaced commands work', () => {
  const state = fresh();
  handle(state, '/context-switch:side x', echo);
  assert.strictEqual(state.stack.length, 1);
});

test('empty /side gets a default title', () => {
  const state = fresh();
  assert.match(handle(state, '/side', echo), /side 1/);
});
