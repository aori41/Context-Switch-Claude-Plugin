const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DIR } = require('./store');

const CHILD_FLAG = 'CONTEXT_SWITCH_CHILD';
const WINDOWS = process.platform === 'win32';
const SESSIONS = path.join(DIR, 'sessions');

const quote = text => (WINDOWS ? `"${text}"` : text);

const args = (thread, project) => ['-p', thread.started ? '--resume' : '--session-id', thread.id, '--add-dir', quote(project)];

function asker(project) {
  return (thread, question) => {
    fs.mkdirSync(SESSIONS, { recursive: true });

    const result = spawnSync('claude', args(thread, project), {
      cwd: SESSIONS,
      input: question,
      encoding: 'utf8',
      shell: WINDOWS,
      env: { ...process.env, [CHILD_FLAG]: '1' },
    });

    if (result.status !== 0) return `⚠ side thread failed: ${(result.stderr || result.error?.message || '').trim()}`;
    thread.started = true;

    return result.stdout.trim();
  };
}

const isChild = () => process.env[CHILD_FLAG] === '1';

module.exports = {
  asker,
  isChild
};
