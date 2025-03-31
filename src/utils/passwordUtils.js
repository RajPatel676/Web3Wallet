/**
 * Password utilities for secure hashing and validation
 */

/**
 * Hashes a password using the SubtleCrypto API (SHA-256)
 * This is more secure than simple hashing algorithms as it's designed for password storage
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - A promise that resolves to the hashed password
 */
export const hashPassword = async (password) => {
  try {
    // Convert the password string to an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Hash the password with SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
};

/**
 * Validates the strength of a password and returns a score
 * @param {string} password - The password to validate
 * @returns {Object} An object containing the score (0-4) and feedback
 */
export const validatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password should be at least 8 characters long");
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Check for numbers
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1.5;
  } else {
    feedback.push("Add special characters");
  }

  // Reduce score for common patterns
  if (/^123|password|qwerty|abc|admin/i.test(password)) {
    score -= 1;
    feedback.push("Avoid common patterns");
  }

  // Limit score to 0-4 range
  score = Math.max(0, Math.min(4, Math.floor(score)));

  return { score, feedback };
};

/**
 * Encrypts sensitive data with the provided password
 * @param {Object} data - The data to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {Promise<string>} - A promise that resolves to the encrypted data
 */
export const encryptData = async (data, password) => {
  try {
    // Convert the password to a key
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive a key from the password
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Encrypt the data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const jsonData = JSON.stringify(data);
    const dataBuffer = encoder.encode(jsonData);

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      dataBuffer
    );

    // Combine salt, IV, and encrypted content into one array
    const encryptedArray = new Uint8Array(
      salt.length + iv.length + encryptedContent.byteLength
    );
    encryptedArray.set(salt, 0);
    encryptedArray.set(iv, salt.length);
    encryptedArray.set(
      new Uint8Array(encryptedContent),
      salt.length + iv.length
    );

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, encryptedArray));
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} encryptedData - The encrypted data in base64 format
 * @param {string} password - The password used for encryption
 * @returns {Promise<Object>} - A promise that resolves to the decrypted data
 */
export const decryptData = async (encryptedData, password) => {
  try {
    // Convert the encrypted data from base64 to Uint8Array
    const encryptedBytes = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    // Extract salt, IV, and encrypted content
    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const encryptedContent = encryptedBytes.slice(28);

    // Convert the password to a key
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Derive a key from the password
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt the data
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedContent
    );

    // Convert the decrypted data to a string and parse as JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedContent);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error(
      "Failed to decrypt data. Incorrect password or corrupted data."
    );
  }
};

/**
 * Lock timeout utility to automatically lock the wallet after inactivity
 */
export class LockTimer {
  constructor(timeoutMinutes = 5, onTimeout = () => {}) {
    this.timeoutMinutes = timeoutMinutes;
    this.onTimeout = onTimeout;
    this.timer = null;
    this.lastActivity = Date.now();
  }

  // Reset the timer on user activity
  resetTimer() {
    this.lastActivity = Date.now();
    this.clearTimer();
    this.startTimer();
  }

  // Start the lock timer
  startTimer() {
    this.timer = setTimeout(() => {
      const now = Date.now();
      const idleTime = (now - this.lastActivity) / 1000 / 60; // in minutes

      if (idleTime >= this.timeoutMinutes) {
        this.onTimeout();
      } else {
        // If not enough time has passed, restart the timer
        this.startTimer();
      }
    }, this.timeoutMinutes * 60 * 1000);
  }

  // Clear the timer
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
