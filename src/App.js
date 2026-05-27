import React, { useState, useEffect } from "react";
import { getProvider, getContract } from "./utils/contract";
import ConnectWallet      from "./components/ConnectWallet";
import IssueCertificate   from "./components/IssueCertificate";
import MyCertificates     from "./components/MyCertificates";
import VerifyCertificate  from "./components/VerifyCertificate";
import {
  FileBadge,
  ShieldCheck,
  GraduationCap,
  Search,
  AlertTriangle,
  RefreshCw,
  Award,
} from "lucide-react";
import "./App.css";

const GANACHE_CHAIN_ID = 1337;

function App() {
  const [account,      setAccount]      = useState(null);
  const [role,         setRole]         = useState(null);
  const [tab,          setTab]          = useState(null);
  const [error,        setError]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const switchToGanache = async () => {
    const chainIdHex = "0x" + GANACHE_CHAIN_ID.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId        : chainIdHex,
              chainName      : "Ganache Local",
              nativeCurrency : { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls        : ["http://127.0.0.1:7545"],
            }],
          });
          return true;
        } catch (addErr) {
          setError("Cannot add Ganache network: " + addErr.message);
          return false;
        }
      }
      setError("Cannot switch network: " + switchErr.message);
      return false;
    }
  };

  const checkNetwork = async () => {
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainId    = parseInt(chainIdHex, 16);
    if (chainId !== GANACHE_CHAIN_ID) {
      setWrongNetwork(true);
      setError(null);
      return false;
    }
    setWrongNetwork(false);
    setError(null);
    return true;
  };

  const detectRole = async (addr) => {
    try {
      const provider   = getProvider();
      const contract   = getContract(provider);
      const ADMIN_ROLE = await contract.ADMIN_ROLE();
      const isAdmin    = await contract.hasRole(ADMIN_ROLE, addr);
      const newRole    = isAdmin ? "admin" : "student";
      setRole(newRole);
      setTab(isAdmin ? "issue" : "my-certs");
      setError(null);
    } catch (err) {
      setRole("student");
      setTab("my-certs");
      setError("Cannot verify role. Make sure Ganache is running and the contract is deployed.");
    }
  };

  const connectWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr     = accounts[0];
      setAccount(addr);

      const onCorrectNetwork = await checkNetwork();
      if (!onCorrectNetwork) {
        setLoading(false);
        const switched = await switchToGanache();
        if (!switched) return;
        return;
      }
      await detectRole(addr);
    } catch (err) {
      if (err.code === 4001) {
        setError("MetaMask connection rejected.");
      } else {
        setError("Connection error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const ok = await checkNetwork();
        if (ok) await detectRole(accounts[0]);
      } else {
        setAccount(null);
        setRole(null);
        setTab(null);
        setError(null);
      }
    });
    window.ethereum.on("chainChanged", () => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminTabs = [
    { id: "issue",    label: "Issue Certificate", icon: <FileBadge size={15} /> },
    { id: "verify",   label: "Verify",            icon: <ShieldCheck size={15} /> },
  ];
  const studentTabs = [
    { id: "my-certs", label: "My Certificates",  icon: <GraduationCap size={15} /> },
    { id: "verify",   label: "Verify",            icon: <Search size={15} /> },
  ];
  const tabs = role === "admin" ? adminTabs : studentTabs;

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo-icon">
            <Award size={18} />
          </div>
          <div>
            <div className="logo">CertChain</div>
            <div className="subtitle">Blockchain Certification Platform</div>
          </div>
        </div>
        <ConnectWallet account={account} onConnect={connectWallet} loading={loading} />
      </header>

      <main className="main">

        {/* ── Wrong network banner ── */}
        {wrongNetwork && (
          <div className="network-warning">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Wrong network detected.</strong> Please switch to{" "}
              <strong>Ganache Local</strong> (Chain ID: {GANACHE_CHAIN_ID}).
            </span>
            <button className="switch-network-btn" onClick={switchToGanache}>
              <RefreshCw size={13} />
              Switch Network
            </button>
          </div>
        )}

        {error && !wrongNetwork && (
          <div className="error">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* ── Not connected ── */}
        {!account && (
          <div className="welcome">
            <div className="welcome-icon">
              <Award size={32} />
            </div>
            <h2>Welcome to CertChain</h2>
            <p>Connect your MetaMask wallet to issue, view, or verify blockchain certificates.</p>
            <button className="btn-primary" onClick={connectWallet} disabled={loading}>
              {loading
                ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Connecting...</>
                : <>Connect MetaMask</>}
            </button>
          </div>
        )}

        {/* ── Connected ── */}
        {account && !wrongNetwork && (
          <div className="dashboard">

            {/* Strip */}
            <div className="dashboard-strip">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {role === "admin"
                  ? <span className="role-badge"><ShieldCheck size={13} /> Administrator</span>
                  : <span className="role-badge"><GraduationCap size={13} /> Student</span>}
                <span className="addr">{account}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                Connected · Ganache Local
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`tab-btn ${tab === t.id ? "tab-btn--active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="tab-content">
              {tab === "issue"    && <IssueCertificate />}
              {tab === "my-certs" && <MyCertificates account={account} />}
              {tab === "verify"   && <VerifyCertificate />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
