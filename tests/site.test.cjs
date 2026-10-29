const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const script = readFileSync(join(__dirname, '../assets/site.js'), 'utf8');
function load(storage = {}) {
  const context = {
    document: { addEventListener() {} },
    localStorage: storage,
    setTimeout,
    requestAnimationFrame: (callback) => callback(),
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  return context;
}

test('blocked browser storage falls back to the system theme', () => {
  const context = load({ getItem() { throw new Error('Storage blocked'); } });
  assert.equal(context.getSavedMode(), 'system');
});

test('theme changes still work when the preference cannot be saved', () => {
  const context = load({ setItem() { throw new Error('Storage blocked'); } });
  assert.doesNotThrow(() => context.saveMode('dark'));
});

test('unknown saved preferences fall back to the system theme', () => {
  const context = load({ getItem() { return 'unknown'; } });
  assert.equal(context.getSavedMode(), 'system');
});

test('a quick close and reopen does not leave an expanded menu hidden', async () => {
  const context = load();
  const trigger = { setAttribute(name, value) { this[name] = value; } };
  const options = {
    hidden: true,
    classList: { add() {}, remove() {} },
    setAttribute(name) { if (name === 'hidden') this.hidden = true; },
    removeAttribute(name) { if (name === 'hidden') this.hidden = false; },
  };
  context.toggleOptions(trigger, options, true);
  context.toggleOptions(trigger, options, false);
  context.toggleOptions(trigger, options, true);
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(trigger['aria-expanded'], 'true');
  assert.equal(options.hidden, false);
});

test('page asset URLs change with their contents so returning visitors load current code', () => {
  const { createHash } = require('node:crypto');
  const { readdirSync } = require('node:fs');
  const root = join(__dirname, '..');
  const files = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html') && !file.startsWith('.git/'));
  for (const file of files) {
    const html = readFileSync(join(root, file), 'utf8');
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/(?:style\.css|site\.js|theme-init\.js))([^\"]*)"/g)];
    assert.equal(assets.length, 3, file);
    for (const [, path, query] of assets) {
      const hash = createHash('sha256').update(readFileSync(join(root, path))).digest('hex').slice(0, 12);
      assert.equal(query, `?v=${hash}`, `${file}: ${path}`);
    }
  }
});
