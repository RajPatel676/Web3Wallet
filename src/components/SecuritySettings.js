import React, { useState } from "react";
import { useSecureWallet } from "../context/SecureWalletContext";
import { hashPassword, validatePasswordStrength } from "../utils/passwordUtils";

const SecuritySettings = () => {
  const { lockWallet, changePassword } = useSecureWallet();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [autoLockTime, setAutoLockTime] = useState(15);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthText, setStrengthText] = useState("");

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (strengthScore < 2) {
      setError("Please use a stronger password");
      return;
    }

    try {
      // Hash the new password
      const newHash = await hashPassword(newPassword);

      // Try to change the password
      const success = await changePassword(
        currentPassword,
        newPassword,
        newHash
      );

      if (success) {
        setSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("Failed to change password");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle auto-lock time change
  const handleAutoLockChange = (e) => {
    setAutoLockTime(parseInt(e.target.value, 10));
    // Save to storage
    chrome.storage.local.set({ autoLockTime: parseInt(e.target.value, 10) });
  };

  // Handle manual lock
  const handleLockWallet = () => {
    lockWallet();
  };

  // Check password strength when it changes
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    if (password) {
      const { score, feedback } = validatePasswordStrength(password);
      setStrengthScore(score);

      const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
      setStrengthText(strengthLabels[Math.min(score, 4)]);
    } else {
      setStrengthScore(0);
      setStrengthText("");
    }
  };

  return (
    <div className="security-settings">
      <h3>Security Settings</h3>

      <div className="settings-section">
        <h4>Change Password</h4>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="Enter new password"
            />

            {newPassword && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-bar strength-${strengthScore}`}
                    style={{ width: `${Math.min(strengthScore * 25, 100)}%` }}
                  ></div>
                </div>
                <div className="strength-text">{strengthText}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="change-password-btn"
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Change Password
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h4>Auto-Lock Settings</h4>
        <div className="form-group">
          <label htmlFor="autoLockTime">
            Auto-lock after inactivity (minutes)
          </label>
          <select
            id="autoLockTime"
            value={autoLockTime}
            onChange={handleAutoLockChange}
          >
            <option value="1">1 minute</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h4>Manual Lock</h4>
        <p>You can manually lock your wallet at any time:</p>
        <button className="lock-wallet-btn" onClick={handleLockWallet}>
          Lock Wallet Now
        </button>
      </div>

      <div className="security-tips">
        <h4>Security Tips</h4>
        <ul>
          <li>Never share your password with anyone</li>
          <li>Use a unique password that you don't use for other accounts</li>
          <li>
            Consider using a password manager to generate and store strong
            passwords
          </li>
          <li>Always lock your wallet when not in use</li>
          <li>
            Be cautious of phishing attempts and only use the official extension
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;
