/**
 * Simple wallet functionality that doesn't rely on external dependencies like bip39
 * Use this only if you encounter issues with the regular wallet implementation
 */

// Generate a random private key (simplified for debugging)
export const generatePrivateKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

// Convert private key to an Ethereum address (very simplified)
export const privateKeyToAddress = (privateKey) => {
  // In a real implementation, we would:
  // 1. Convert private key to public key using elliptic curve cryptography
  // 2. Hash the public key with keccak256
  // 3. Take the last 20 bytes of the hash

  // For debugging purposes, we'll return a deterministic but fake address
  const hash = simpleHash(privateKey);
  return `0x${hash.substring(0, 40)}`;
};

// Create a simple "wallet" object with a generated private key
export const createSimpleWallet = (name) => {
  const privateKey = generatePrivateKey();
  const address = privateKeyToAddress(privateKey);

  return {
    name,
    address,
    privateKey,
  };
};

// Generate multiple accounts from a "seed phrase"
export const generateAccounts = (seed, count = 1) => {
  const accounts = {};

  for (let i = 0; i < count; i++) {
    // Create a deterministic but unique private key for each account
    const derivedSeed = `${seed}_${i}`;
    const privateKey = simpleHash(derivedSeed);
    const address = privateKeyToAddress(privateKey);

    accounts[address] = {
      name: `Account ${i + 1}`,
      address,
      privateKey,
    };
  }

  return accounts;
};

// A very simple hash function (do not use for security purposes)
const simpleHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to hex string and pad
  const hexHash = Math.abs(hash).toString(16).padStart(64, "0");
  return hexHash;
};

// Generate a simple mnemonic phrase (not BIP39 compatible)
export const generateSimpleMnemonic = () => {
  const words = [
    "apple",
    "banana",
    "orange",
    "grape",
    "lemon",
    "kiwi",
    "cat",
    "dog",
    "bird",
    "fish",
    "lion",
    "tiger",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "car",
    "bike",
    "train",
    "plane",
    "boat",
    "bus",
  ];

  const selectedWords = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }

  return selectedWords.join(" ");
};
