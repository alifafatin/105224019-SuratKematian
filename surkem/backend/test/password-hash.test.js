const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const test = require('node:test');

test('kata sandi disimpan sebagai bcrypt cost 12 dan diverifikasi tanpa plaintext', async () => {
  const syntheticPassword = 'Password-Uji-Sintetis-2026!';
  const storedHash = await bcrypt.hash(syntheticPassword, 12);

  assert.notEqual(storedHash, syntheticPassword);
  assert.match(storedHash, /^\$2[aby]\$12\$/);
  assert.equal(await bcrypt.compare(syntheticPassword, storedHash), true);
  assert.equal(await bcrypt.compare('Password-Salah-Sintetis!', storedHash), false);
});
