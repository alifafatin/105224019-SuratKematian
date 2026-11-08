const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const test = require('node:test');
const {
  decryptSensitiveValue,
  encryptSensitiveValue,
  getEncryptionKey,
} = require('../src/security/sensitive-data');

const key = randomBytes(32).toString('base64');
const context = 'DeathReport.deceasedNik';
const syntheticNik = '3201010101010002';

function changeEnvelopePart(envelope, partIndex) {
  const parts = envelope.split('.');
  const bytes = Buffer.from(parts[partIndex], 'base64');
  bytes[0] ^= 1;
  parts[partIndex] = bytes.toString('base64');
  return parts.join('.');
}

test('NIK terenkripsi dapat didekripsi kembali dengan konteks yang sama', () => {
  const encrypted = encryptSensitiveValue(syntheticNik, context, key);
  assert.notEqual(encrypted, syntheticNik);
  assert.equal(decryptSensitiveValue(encrypted, context, key), syntheticNik);
});

test('setiap enkripsi memakai nonce berbeda', () => {
  const first = encryptSensitiveValue(syntheticNik, context, key);
  const second = encryptSensitiveValue(syntheticNik, context, key);
  assert.notEqual(first.split('.')[1], second.split('.')[1]);
  assert.notEqual(first, second);
});

test('nilai terenkripsi dapat dipulihkan dengan AAD field yang benar', () => {
  const encrypted = encryptSensitiveValue(syntheticNik, context, key);
  assert.equal(decryptSensitiveValue(encrypted, context, key), syntheticNik);
});

test('perubahan ciphertext ditolak', () => {
  const encrypted = encryptSensitiveValue(syntheticNik, context, key);
  assert.throws(() =>
    decryptSensitiveValue(changeEnvelopePart(encrypted, 3), context, key)
  );
});

test('perubahan tag autentikasi ditolak', () => {
  const encrypted = encryptSensitiveValue(syntheticNik, context, key);
  assert.throws(() =>
    decryptSensitiveValue(changeEnvelopePart(encrypted, 2), context, key)
  );
});

test('kunci yang salah dan konteks AAD yang berbeda ditolak', () => {
  const encrypted = encryptSensitiveValue(syntheticNik, context, key);
  const wrongKey = randomBytes(32).toString('base64');

  assert.throws(() => decryptSensitiveValue(encrypted, context, wrongKey));
  assert.throws(() =>
    decryptSensitiveValue(encrypted, 'DeathReport.reporterNik', key)
  );
});

test('kunci yang tidak valid ditolak', () => {
  assert.throws(() => getEncryptionKey(''));
  assert.throws(() => getEncryptionKey(randomBytes(31).toString('base64')));
});
