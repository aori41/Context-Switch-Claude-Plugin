const fs = require('node:fs');

const MAX_MESSAGES = 20;
const MAX_CHARS = 600;

const clip = text => (text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}…` : text);

function textOf(entry) {
  const content = entry.message?.content;
  if (typeof content === 'string') return content.startsWith('<') ? '' : content;
  if (!Array.isArray(content)) return '';
  
  return content.filter(part => part.type === 'text').map(part => part.text).join('\n');
}

function messages(transcript) {
  return transcript
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return {};
      }
    })
    .filter(entry => (entry.type === 'user' || entry.type === 'assistant') && !entry.isMeta)
    .map(entry => ({ role: entry.type, text: textOf(entry).trim() }))
    .filter(message => message.text);
}

function recap(transcript) {
  const recent = messages(transcript).slice(-MAX_MESSAGES);
  if (!recent.length) return '';

  const lines = recent.map(m => `${m.role === 'user' ? 'Me' : 'Claude'}: ${clip(m.text)}`);
  return `Background from my main conversation (just context, don't act on it):\n\n${lines.join('\n\n')}\n\n---\n\n`;
}

function readRecap(file) {
  try {
    return recap(fs.readFileSync(file, 'utf8'));
  } catch {
    return '';
  }
}

module.exports = {
  recap,
  readRecap
};
