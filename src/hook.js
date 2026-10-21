#!/usr/bin/env node
const { handle } = require('./threads');
const { load, save } = require('./store');
const { asker, isChild } = require('./claude');

async function readInput() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  return JSON.parse(raw);
}

async function main() {
  if (isChild()) return;

  const { session_id: sessionId, prompt, cwd } = await readInput();
  const state = load(sessionId);
  const reply = handle(state, prompt, asker(cwd));
  if (reply === null) return;

  save(sessionId, state);
  process.stdout.write(JSON.stringify({ decision: 'block', reason: reply }));
}

main().catch(error => {
  process.stderr.write(`context-switch: ${error.message}\n`);
});
