import React from "react";

const ConnectWallet = ({ account, onConnect }) => {
  return (
    <div style={styles.container}>
      {account ? (
        <div style={styles.connected}>
          <span style={styles.dot} />
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      ) : (
        <button style={styles.btn} onClick={onConnect}>
          Connecter MetaMask
        </button>
      )}
    </div>
  );
};

const styles = {
  container: { display: "flex", alignItems: "center" },
  btn: {
    background: "#f6851b",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  connected: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#e8f5e9",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#2e7d32",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#4caf50",
    display: "inline-block",
  },
};

export default ConnectWallet;