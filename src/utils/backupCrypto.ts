// Encryption and cryptographic hashing for secure backups
// Uses standard Web Crypto API (SubtleCrypto) supported in all modern browsers

/**
 * Computes SHA-256 hex string for integrity validation
 */
export async function computeSha256(data: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Basic fallback hash if crypto.subtle is not accessible
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts a string with a user-defined password using AES-256-GCM and PBKDF2
 */
export async function encryptData(plainText: string, password: string): Promise<string> {
  if (!password) {
    return plainText;
  }

  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encodedData = enc.encode(plainText);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encodedData
  );

  const payload = {
    cipher: 'AES-256-GCM',
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedBuffer))
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts an encrypted backup string using the password
 */
export async function decryptData(cipherJson: string, password: string): Promise<string> {
  let parsed: any;
  try {
    parsed = JSON.parse(cipherJson);
  } catch {
    // If not JSON, it might already be plain text
    return cipherJson;
  }

  // If not encrypted structure, return as is
  if (!parsed.cipher || !parsed.salt || !parsed.iv || !parsed.data) {
    return cipherJson;
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const salt = new Uint8Array(parsed.salt);
  const iv = new Uint8Array(parsed.iv);
  const encryptedBytes = new Uint8Array(parsed.data);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encryptedBytes
  );

  return dec.decode(decryptedBuffer);
}
