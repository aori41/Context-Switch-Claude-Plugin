const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DIR = path.join(os.homedir(), '.claude', 'context-switch');

const file = sessionId => path.join(DIR, `${sessionId.replace(/[^\w-]/g, '')}.json`);

function load(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(file(sessionId), 'utf8'));
  } catch {
    return {
      threads: [],
      stack: []
    };
  }
}

function save(sessionId, state) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(file(sessionId), JSON.stringify(state, null, 2));
}

module.exports = {
  DIR,
  load,
  save
};
