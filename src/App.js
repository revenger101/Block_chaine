import React, { useState, useEffect } from "react";
import { getProvider } from "./utils/contract";
import ConnectWallet from "./components/ConnectWallet";
import "./App.css";

// Adresse de l'admin = Membre 1 va te donner l'adresse du deployer
const ADMIN_ADDRESS = "0x259eE124A134a7686C94a66B997bBF7B0906F2Da"; 

function App() {
  const [account, setAccount]   = useState(null);
  const [role, setRole]         = useState(null); // "admin" ou "student"
  const [error, setError]       = useState(null);

  const connectWallet = async () => {
    try {
      const provider = getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAccount(addr);
      detectRole(addr);
    } catch (err) {
      setError("Connexion MetaMask refusée.");
    }
  };

  const detectRole = (addr) => {
    if (addr.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      setRole("admin");
    } else {
      setRole("student");
    }
  };

  // Écoute si l'utilisateur change de compte dans MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          detectRole(accounts[0]);
        } else {
          setAccount(null);
          setRole(null);
        }
      });
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🎓 CertChain</h1>
          <span className="subtitle">Certification sur Blockchain</span>
        </div>
        <ConnectWallet account={account} onConnect={connectWallet} />
      </header>

      <main className="main">
        {error && <div className="error">{error}</div>}

        {!account && (
          <div className="welcome">
            <h2>Bienvenue sur CertChain</h2>
            <p>Connecte ton wallet MetaMask pour continuer.</p>
            <button className="btn-primary" onClick={connectWallet}>
              Connecter MetaMask
            </button>
          </div>
        )}

        {account && (
          <div className="dashboard">
            <div className="role-badge">
              {role === "admin" ? "👨‍🏫 Mode Administrateur" : "🎓 Mode Étudiant"}
            </div>
            <p className="addr">Adresse : {account}</p>
            {/* Semaine 2 : ici on affichera les composants selon le rôle */}
            <div className="placeholder">
              <p>Interface en cours de construction... (Semaine 2)</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;