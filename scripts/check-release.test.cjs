const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldPublish } = require('./check-release.cjs');
const registry = {
  name: 'sudoku-easy-solver',
  versions: { '1.0.0': {} },
  'dist-tags': { latest: '1.0.0' },
};
const pkg = version => ({ name: registry.name, version });

test('new patch, minor and major releases publish independently of git history', () => {
  for (const version of ['1.0.1', '1.1.0', '2.0.0']) {
    assert.equal(shouldPublish(pkg(version), registry), true);
  }
});
test('rerunning an existing release skips publishing', () => {
  assert.equal(shouldPublish(pkg('1.0.0'), registry), false);
});
test('old or prerelease versions cannot replace latest', () => {
  for (const version of ['0.9.9', '1.1.0-beta.1', '01.1.0']) {
    assert.throws(() => shouldPublish(pkg(version), registry));
  }
});
test('malformed metadata and mismatched package names fail closed', () => {
  assert.throws(() => shouldPublish(pkg('1.0.1'), { name: registry.name }));
  assert.throws(() => shouldPublish(pkg('1.0.1'), { ...registry, name: 'another-package' }));
  assert.throws(() => shouldPublish(pkg('1.0.1'), { ...registry, 'dist-tags': {} }));
});
