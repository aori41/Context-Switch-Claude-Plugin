const test = require('node:test');
const assert = require('node:assert');
const { recap } = require('../src/recap');

const line = entry => JSON.stringify(entry);

test('recap keeps the conversation text and skips the noise', () => {
  const transcript = [
    line({ type: 'user', message: { content: 'make the jump higher' } }),
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'Raised it to 8.' }, { type: 'tool_use', name: 'Edit' }] } }),
    line({ type: 'user', message: { content: [{ type: 'tool_result', content: 'ok' }] } }),
    line({ type: 'user', isMeta: true, message: { content: 'meta' } }),
    line({ type: 'user', message: { content: '<command-name>/clear</command-name>' } }),
    'not json',
  ].join('\n');

  const text = recap(transcript);
  assert.match(text, /Me: make the jump higher\n\nClaude: Raised it to 8\./);
  assert.doesNotMatch(text, /meta|tool_result|command-name|Edit/);
});

test('recap is empty for an empty conversation', () => {
  assert.strictEqual(recap(''), '');
});

test('recap keeps only the last messages, clipped', () => {
  const many = Array.from({ length: 30 }, (_, i) => line({ type: 'user', message: { content: `msg ${i} ${'x'.repeat(700)}` } }));
  const text = recap(many.join('\n'));
  assert.doesNotMatch(text, /msg 9 /);
  assert.match(text, /msg 10 /);
  assert.match(text, /x…/);
});
