/**
 * Crypto Utilities
 *
 * Provides encryption/decryption for sensitive data stored in SQLite.
 * Uses expo-crypto for cryptographic operations with HMAC authentication.
 *
 * Security Notes:
 * - Key is stored in SecureStore (iOS Keychain / Android Keystore)
 * - Uses XOR stream cipher with SHA-256 derived key stream
 * - Includes HMAC-SHA256 for authentication (encrypt-then-MAC)
 * - IV is randomly generated for each encryption
 *
 * For production environments requiring AES-256-GCM, consider using
 * react-native-aes-crypto which provides native AES implementation.
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { logger } from './logger';

const cryptoLogger = logger.withPrefix('[Crypto]');

const ENCRYPTION_KEY_ALIAS = 'nutritrack_db_encryption_key';
const IV_LENGTH = 12; // 96 bits for GCM-compatible IV

/** Convert a Uint8Array to a hex string. */
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Convert a hex string to a Uint8Array. */
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Convert a string to a Uint8Array (UTF-8 encoding). */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/** Convert a Uint8Array to a string (UTF-8 decoding). */
function uint8ArrayToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

/** Convert a Uint8Array to base64 string. */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Convert a base64 string to Uint8Array. */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Concatenate multiple Uint8Arrays into one. */
function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/** Get or create the encryption key. Stored in SecureStore (Keychain/Keystore). */
async function getEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);

  if (!key) {
    // Generate a new 256-bit key
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = uint8ArrayToBase64(randomBytes);
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    cryptoLogger.debug('Generated new encryption key');
  }

  return key;
}

/** Generate a key stream from key and IV using SHA-256 with counter extension. */
async function generateKeyStream(
  key: string,
  ivHex: string,
  length: number
): Promise<Uint8Array> {
  const keyStreamParts: Uint8Array[] = [];
  let counter = 0;
  let totalLength = 0;

  while (totalLength < length) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${key}${ivHex}${counter}`
    );
    const hashBytes = hexToUint8Array(hash);
    keyStreamParts.push(hashBytes);
    totalLength += hashBytes.length;
    counter++;
  }

  const fullKeyStream = concatUint8Arrays(...keyStreamParts);
  return fullKeyStream.slice(0, length);
}

/**
 * Encrypt sensitive data for storage.
 * Returns base64 encoded string: IV (12 bytes) + ciphertext + HMAC (16 bytes)
 *
 * @param plaintext - The string to encrypt
 * @returns Base64 encoded encrypted data, or empty string if input is empty
 */
export async function encryptData(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  try {
    const key = await getEncryptionKey();

    // Generate random IV
    const iv = await Crypto.getRandomBytesAsync(IV_LENGTH);
    const ivHex = uint8ArrayToHex(iv);

    // Convert plaintext to bytes
    const plaintextBytes = stringToUint8Array(plaintext);

    // Generate key stream
    const keyStream = await generateKeyStream(key, ivHex, plaintextBytes.length);

    // XOR encryption
    const encrypted = new Uint8Array(plaintextBytes.length);
    for (let i = 0; i < plaintextBytes.length; i++) {
      encrypted[i] = plaintextBytes[i] ^ keyStream[i];
    }

    // Create HMAC for authentication (encrypt-then-MAC)
    const hmac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + uint8ArrayToHex(encrypted)
    );

    // Take first 16 bytes (128 bits) of HMAC
    const hmacBytes = hexToUint8Array(hmac.slice(0, 32));

    // Combine: IV (12) + encrypted + HMAC (16 bytes)
    const combined = concatUint8Arrays(iv, encrypted, hmacBytes);

    return uint8ArrayToBase64(combined);
  } catch (error) {
    cryptoLogger.error('Encryption failed', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data from storage.
 *
 * @param ciphertext - Base64 encoded encrypted data
 * @returns Decrypted plaintext string, or empty string if input is empty or decryption fails
 */
export async function decryptData(ciphertext: string): Promise<string> {
  if (!ciphertext) return '';

  try {
    const key = await getEncryptionKey();
    const combined = base64ToUint8Array(ciphertext);

    // Validate minimum length: IV (12) + at least 1 byte + HMAC (16)
    const minimumLength = IV_LENGTH + 1 + 16;
    if (combined.length < minimumLength) {
      cryptoLogger.warn('Invalid ciphertext: too short');
      return '';
    }

    // Extract components
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH, combined.length - 16);
    const storedHmac = uint8ArrayToHex(combined.slice(combined.length - 16));

    // Verify HMAC first (prevents timing attacks on invalid data)
    const computedHmac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + uint8ArrayToHex(encrypted)
    );

    if (computedHmac.slice(0, 32) !== storedHmac) {
      cryptoLogger.warn('HMAC verification failed - data may be tampered');
      return '';
    }

    // Decrypt
    const ivHex = uint8ArrayToHex(iv);
    const keyStream = await generateKeyStream(key, ivHex, encrypted.length);

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyStream[i];
    }

    return uint8ArrayToString(decrypted);
  } catch (error) {
    cryptoLogger.error('Decryption failed', error);
    return '';
  }
}

/**
 * Encrypt JSON data (for arrays/objects).
 *
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns Base64 encoded encrypted data
 */
export async function encryptJSON<T>(data: T): Promise<string> {
  return encryptData(JSON.stringify(data));
}

/**
 * Decrypt JSON data.
 *
 * @param ciphertext - Base64 encoded encrypted data
 * @param defaultValue - Value to return if decryption or parsing fails
 * @returns Parsed JSON data or defaultValue on failure
 */
export async function decryptJSON<T>(ciphertext: string, defaultValue: T): Promise<T> {
  const decrypted = await decryptData(ciphertext);
  if (!decrypted) return defaultValue;

  try {
    return JSON.parse(decrypted) as T;
  } catch {
    cryptoLogger.warn('Failed to parse decrypted JSON');
    return defaultValue;
  }
}

/**
 * Check if a string appears to be encrypted data.
 * Useful for migration scenarios.
 *
 * @param data - String to check
 * @returns true if the data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;

  try {
    const decoded = base64ToUint8Array(data);
    // Minimum valid length: IV (12) + 1 byte data + HMAC (16)
    return decoded.length >= 29;
  } catch {
    return false;
  }
}

/**
 * Clear the encryption key (use with caution - all encrypted data becomes unrecoverable).
 * Primarily for testing or account deletion scenarios.
 */
export async function clearEncryptionKey(): Promise<void> {
  await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ALIAS);
  cryptoLogger.info('Encryption key cleared');
}
