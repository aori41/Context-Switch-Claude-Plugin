const { randomUUID } = require('node:crypto');

const COMMAND = /^\/(?:context-switch:)?(side|back|threads)\b\s*([\s\S]*)$/;

const current = state => state.threads[state.stack.at(-1)];

const label = state => current(state)?.topic ?? 'main thread';

function list(state) {
  if (!state.threads.length) return 'No side threads yet. Start one with /side <topic>.';

  const open = new Set(state.stack);
  const rows = state.threads.map((t, i) => `${open.has(i) ? '●' : '○'} ${i + 1}. ${t.topic}`);

  return [...rows, '', 'Jump with /threads <number>.'].join('\n');
}

function open(state, index, question, ask) {
  state.stack.push(index);
  const header = `↪ side: ${current(state).topic}`;
  return question ? `${header}\n\n${ask(current(state), question)}` : `${header}\n\nAsk away. /back returns to ${state.stack.length > 1 ? 'the previous thread' : 'the main thread'}.`;
}

function side(state, topic, ask) {
  const title = topic.split('\n')[0].slice(0, 60) || `side ${state.threads.length + 1}`;
  state.threads.push({ id: randomUUID(), topic: title, started: false });
  return open(state, state.threads.length - 1, topic, ask);
}

function back(state) {
  if (!state.stack.length) return 'Already on the main thread.';
  state.stack.pop();
  return `↩ back to ${label(state)}`;
}

function threads(state, arg, ask) {
  const n = Number.parseInt(arg, 10);
  if (!arg) return list(state);
  if (!state.threads[n - 1]) return `No thread ${arg}.\n\n${list(state)}`;

  return open(state, n - 1, '', ask);
}

function handle(state, prompt, ask) {
  const match = prompt.trim().match(COMMAND);
  if (match) {
    const [, name, arg] = match;
    if (name === 'side') return side(state, arg.trim(), ask);
    if (name === 'back') return back(state);
    return threads(state, arg.trim(), ask);
  }

  if (state.stack.length) return `↪ ${label(state)}\n\n${ask(current(state), prompt)}`;
  return null;
}

module.exports = {
  handle
};
