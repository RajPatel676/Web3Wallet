import React, { useState, useEffect } from "react";
import { hashPassword, validatePasswordStrength } from "../utils/passwordUtils";

const PasswordSetup = ({ onPasswordSet, existingHash = null }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthText, setStrengthText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isVerification = !!existingHash;

  useEffect(() => {
    if (!isVerification && password) {
      const { score, feedback } = validatePasswordStrength(password);
      setStrengthScore(score);

      const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
      setStrengthText(strengthLabels[Math.min(score, 4)]);
    }
  }, [password, isVerification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isVerification) {
      // Verify existing password
      try {
        const hashedInput = await hashPassword(password);
        if (hashedInput === existingHash) {
          onPasswordSet(password, hashedInput);
        } else {
          setError("Incorrect password");
        }
      } catch (err) {
        setError("Error verifying password: " + err.message);
      }
    } else {
      // Create new password
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      if (strengthScore < 2) {
        setError("Please use a stronger password");
        return;
      }

      try {
        const hashedPassword = await hashPassword(password);
        onPasswordSet(password, hashedPassword);
      } catch (err) {
        setError("Error creating password: " + err.message);
      }
    }
  };

  return (
    <div className="password-setup">
      <h3>{isVerification ? "Enter Your Password" : "Create Password"}</h3>

      {!isVerification && (
        <p className="password-info">
          Your password will be used to encrypt your wallet data. Make sure to
          use a strong password that you won't forget.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="password-field">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder={
                isVerification ? "Enter your password" : "Create a password"
              }
              autoFocus
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {!isVerification && (
          <>
            <div className="password-strength">
              <div className="strength-meter">
                <div
                  className={`strength-bar strength-${strengthScore}`}
                  style={{ width: `${Math.min(strengthScore * 25, 100)}%` }}
                ></div>
              </div>
              <div className="strength-text">
                {password ? strengthText : ""}
              </div>
            </div>

            <div className="password-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={password.length >= 8 ? "met" : ""}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "met" : ""}>
                  At least one uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? "met" : ""}>
                  At least one lowercase letter
                </li>
                <li className={/[0-9]/.test(password) ? "met" : ""}>
                  At least one number
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? "met" : ""}>
                  At least one special character
                </li>
              </ul>
            </div>
          </>
        )}

        {error && <div className="auth-error">{error}</div>}

        <button
          type="submit"
          className="password-submit-btn"
          disabled={isVerification ? !password : !password || !confirmPassword}
        >
          {isVerification ? "Unlock Wallet" : "Create Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordSetup;
