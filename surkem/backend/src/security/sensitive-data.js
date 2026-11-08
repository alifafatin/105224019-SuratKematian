const { createCipheriv, createDecipheriv, randomBytes } = require('node:crypto');

const KEY_BYTES = 32;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const ENVELOPE_VERSION = 'v1';

function getEncryptionKey(encodedKey = process.env.ENCRYPTION_KEY_BASE64) {
  if (
    typeof encodedKey !== 'string' ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encodedKey) ||
    encodedKey.length % 4 !== 0
  ) {
    throw new Error('ENCRYPTION_KEY_BASE64 harus berupa kunci Base64 32 byte.');
  }

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== KEY_BYTES || key.toString('base64') !== encodedKey) {
    throw new Error('ENCRYPTION_KEY_BASE64 harus berupa kunci Base64 32 byte.');
  }
  return key;
}

function decodeBase64(value) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new Error('Format data terenkripsi tidak valid.');
  }

  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value) {
    throw new Error('Format data terenkripsi tidak valid.');
  }
  return decoded;
}

function validateContext(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Konteks AAD harus berupa string yang tidak kosong.');
  }
  return Buffer.from(value, 'utf8');
}

function encryptSensitiveValue(value, associatedData, encodedKey) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Nilai yang akan dienkripsi harus berupa string yang tidak kosong.');
  }

  const key = getEncryptionKey(encodedKey);
  const aad = validateContext(associatedData);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, nonce, {
    authTagLength: TAG_BYTES,
  });
  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    ENVELOPE_VERSION,
    nonce.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join('.');
}

function decryptSensitiveValue(envelope, associatedData, encodedKey) {
  if (typeof envelope !== 'string') {
    throw new Error('Format data terenkripsi tidak valid.');
  }

  const parts = envelope.split('.');
  if (parts.length !== 4 || parts[0] !== ENVELOPE_VERSION) {
    throw new Error('Format data terenkripsi tidak valid.');
  }

  const nonce = decodeBase64(parts[1]);
  const tag = decodeBase64(parts[2]);
  const ciphertext = decodeBase64(parts[3]);
  if (nonce.length !== NONCE_BYTES || tag.length !== TAG_BYTES) {
    throw new Error('Format data terenkripsi tidak valid.');
  }

  const key = getEncryptionKey(encodedKey);
  const aad = validateContext(associatedData);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce, {
    authTagLength: TAG_BYTES,
  });
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = {
  decryptSensitiveValue,
  encryptSensitiveValue,
  getEncryptionKey,
};
