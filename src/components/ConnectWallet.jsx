import React from "react";
import { Wallet, ChevronDown, Loader2 } from "lucide-react";

const ConnectWallet = ({ account, onConnect, loading }) => {
  return (
    <div>
      {account ? (
        <div style={styles.connected}>
          <span style={styles.dot} />
          <span style={styles.address}>
            {account.slice(0, 6)}…{account.slice(-4)}
          </span>
          <ChevronDown size={14} color="#64748b" />
        </div>
      ) : (
        <button style={styles.btn} onClick={onConnect} disabled={loading}>
          {loading
            ? <Loader2 size={15} style={styles.spin} />
            : <Wallet size={15} />}
          <span>{loading ? "Connecting…" : "Connect Wallet"}</span>
        </button>
      )}
    </div>
  );
};

const styles = {
  btn: {
    display       : "inline-flex",
    alignItems    : "center",
    gap           : "7px",
    background    : "#f97316",
    color         : "#fff",
    border        : "none",
    padding       : "9px 18px",
    borderRadius  : "8px",
    cursor        : "pointer",
    fontWeight    : "600",
    fontSize      : "13px",
    boxShadow     : "0 2px 8px rgba(249,115,22,0.30)",
    transition    : "background 0.15s, transform 0.1s",
  },
  connected: {
    display       : "flex",
    alignItems    : "center",
    gap           : "8px",
    background    : "#f0fdf4",
    border        : "1px solid #bbf7d0",
    padding       : "8px 14px",
    borderRadius  : "8px",
    fontSize      : "13px",
    fontWeight    : "600",
    color         : "#166534",
    cursor        : "default",
  },
  dot: {
    width        : "7px",
    height       : "7px",
    borderRadius : "50%",
    background   : "#22c55e",
    display      : "inline-block",
    boxShadow    : "0 0 0 2px #bbf7d0",
  },
  address: {
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize  : "13px",
    color     : "#0f172a",
    fontWeight: "500",
  },
  spin: {
    animation: "spin 1s linear infinite",
  },
};

export default ConnectWallet;
