import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const WalletSetup = () => {
  const { createWalletFromMnemonic, importWalletFromMnemonic } = useContext(
    SimplifiedWalletContext
  );
  const [setupType, setSetupType] = useState(""); // "create" or "import"
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicArray, setMnemonicArray] = useState([]);
  const [walletName, setWalletName] = useState("My Wallet");
  const [isBackedUp, setIsBackedUp] = useState(false);
  const [importError, setImportError] = useState("");
  const [verificationWords, setVerificationWords] = useState([]);
  const [verificationInput, setVerificationInput] = useState({});
  const [verificationError, setVerificationError] = useState("");

  // Generate a new mnemonic when creating a wallet
  useEffect(() => {
    if (setupType === "create" && step === 2) {
      // Generate a random mnemonic (12 words) using ethers v6
      const wallet = ethers.Wallet.createRandom();
      const generatedMnemonic = wallet.mnemonic?.phrase;
      setMnemonic(generatedMnemonic);
      setMnemonicArray(generatedMnemonic.split(" "));
    }
  }, [setupType, step]);

  // Set up verification words (3 random words from the mnemonic)
  useEffect(() => {
    if (setupType === "create" && step === 3 && mnemonicArray.length > 0) {
      const indices = [];
      while (indices.length < 3) {
        const index = Math.floor(Math.random() * mnemonicArray.length);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
      setVerificationWords(indices);
      setVerificationInput({});
    }
  }, [step, mnemonicArray, setupType]);

  const handleCreateWallet = () => {
    setSetupType("create");
    setStep(2);
  };

  const handleImportWallet = () => {
    setSetupType("import");
    setStep(2);
  };

  const handleImportComplete = () => {
    if (!mnemonic.trim()) {
      setImportError("Please enter your seed phrase");
      return;
    }

    try {
      // Validate the mnemonic using ethers v6
      // Check if the mnemonic is valid by trying to create a wallet from it
      try {
        ethers.Wallet.fromPhrase(mnemonic.trim());
      } catch (e) {
        setImportError("Invalid seed phrase. Please check and try again.");
        return;
      }

      importWalletFromMnemonic(mnemonic, walletName);
    } catch (error) {
      setImportError(`Error importing wallet: ${error.message}`);
    }
  };

  const handleBackupConfirmed = () => {
    setIsBackedUp(true);
    setStep(3);
  };

  const handleVerificationInputChange = (index, value) => {
    setVerificationInput({
      ...verificationInput,
      [index]: value.toLowerCase(),
    });
    setVerificationError("");
  };

  const handleVerificationComplete = () => {
    // Check if the verification words match
    const isCorrect = verificationWords.every(
      (index) =>
        verificationInput[index]?.toLowerCase() ===
        mnemonicArray[index]?.toLowerCase()
    );

    if (isCorrect) {
      // Create the wallet with the mnemonic
      createWalletFromMnemonic(mnemonic, walletName);
    } else {
      setVerificationError("The words don't match. Please try again.");
    }
  };

  const downloadMnemonic = () => {
    const element = document.createElement("a");
    const file = new Blob([mnemonic], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "wallet-seed-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderStep = () => {
    if (setupType === "") {
      // Initial setup choice
      return (
        <div className="setup-choice">
          <h3>Welcome to Web3 Wallet</h3>
          <p>Choose how you want to set up your wallet:</p>

          <button className="setup-button create" onClick={handleCreateWallet}>
            <span className="icon">➕</span>
            <div className="button-content">
              <span className="button-title">Create New Wallet</span>
              <span className="button-description">
                Generate a new wallet with a seed phrase
              </span>
            </div>
          </button>

          <button className="setup-button import" onClick={handleImportWallet}>
            <span className="icon">↑</span>
            <div className="button-content">
              <span className="button-title">Import Existing Wallet</span>
              <span className="button-description">
                Restore from a seed phrase
              </span>
            </div>
          </button>
        </div>
      );
    } else if (setupType === "create") {
      if (step === 2) {
        // Seed phrase display and backup
        return (
          <div className="seed-phrase-section">
            <h3>Your Seed Phrase</h3>
            <p className="warning">
              <strong>Warning:</strong> Never share these words with anyone!
              They provide full access to your wallet.
            </p>

            <div className="seed-phrase-container">
              {mnemonicArray.map((word, index) => (
                <div key={index} className="seed-word">
                  <span className="word-number">{index + 1}</span>
                  <span className="word">{word}</span>
                </div>
              ))}
            </div>

            <div className="backup-actions">
              <button className="backup-button" onClick={downloadMnemonic}>
                Download Seed Phrase
              </button>

              <label className="backup-confirmation">
                <input
                  type="checkbox"
                  checked={isBackedUp}
                  onChange={(e) => setIsBackedUp(e.target.checked)}
                />
                I have backed up my seed phrase in a secure location
              </label>

              <button
                className="continue-button"
                disabled={!isBackedUp}
                onClick={handleBackupConfirmed}
              >
                Continue
              </button>
            </div>
          </div>
        );
      } else if (step === 3) {
        // Verification step
        return (
          <div className="verification-section">
            <h3>Verify Your Seed Phrase</h3>
            <p>
              Please enter the following words from your seed phrase to confirm
              you've saved it:
            </p>

            <div className="verification-inputs">
              {verificationWords.map((wordIndex) => (
                <div key={wordIndex} className="verification-input">
                  <label>Word #{wordIndex + 1}</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      handleVerificationInputChange(wordIndex, e.target.value)
                    }
                    value={verificationInput[wordIndex] || ""}
                    className={verificationError ? "error" : ""}
                  />
                </div>
              ))}
            </div>

            {verificationError && (
              <div className="error-message">{verificationError}</div>
            )}

            <button
              className="verify-button"
              onClick={handleVerificationComplete}
              disabled={verificationWords.some(
                (index) => !verificationInput[index]
              )}
            >
              Create My Wallet
            </button>
          </div>
        );
      }
    } else if (setupType === "import") {
      // Import wallet
      return (
        <div className="import-section">
          <h3>Import Wallet</h3>
          <p>Enter your 12 or 24-word seed phrase to restore your wallet:</p>

          <div className="wallet-name-input">
            <label>Wallet Name (Optional)</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="My Wallet"
            />
          </div>

          <div className="mnemonic-input">
            <label>Seed Phrase (space-separated)</label>
            <textarea
              value={mnemonic}
              onChange={(e) => {
                setMnemonic(e.target.value);
                setImportError("");
              }}
              placeholder="Enter your seed phrase words separated by spaces"
              rows={4}
              className={importError ? "error" : ""}
            />
          </div>

          {importError && <div className="error-message">{importError}</div>}

          <div className="import-actions">
            <button
              className="back-button"
              onClick={() => {
                setSetupType("");
                setStep(1);
                setImportError("");
              }}
            >
              Back
            </button>
            <button
              className="import-button"
              onClick={handleImportComplete}
              disabled={!mnemonic.trim()}
            >
              Import Wallet
            </button>
          </div>
        </div>
      );
    }
  };

  return <div className="wallet-setup">{renderStep()}</div>;
};

export default WalletSetup;
