import React, { useState } from "react";
import { getProvider, getContract } from "../utils/contract";
import axios from "axios";
import {
  ShieldCheck,
  ShieldX,
  Search,
  Hash,
  User,
  BookOpen,
  Calendar,
  Wallet,
  ExternalLink,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const ipfsToHttp = (uri) =>
  uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : uri;

const traitIcon = (trait) => {
  const t = trait?.toLowerCase() ?? "";
  if (t.includes("student") || t.includes("name"))   return <User     size={12} />;
  if (t.includes("course"))                           return <BookOpen size={12} />;
  if (t.includes("date"))                             return <Calendar size={12} />;
  if (t.includes("wallet") || t.includes("address")) return <Wallet   size={12} />;
  return null;
};

const VerifyCertificate = () => {
  const [tokenId,  setTokenId]  = useState("");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const provider = getProvider();
      const contract = getContract(provider);

      // 1. Ownership check
      let owner;
      try {
        owner = await contract.ownerOf(tokenId);
      } catch {
        setError(`Certificate #${tokenId} does not exist on the blockchain.`);
        setLoading(false);
        return;
      }

      // 2. Fetch tokenURI + IPFS metadata
      const tokenURI = await contract.tokenURI(tokenId);
      let metadata   = null;
      try {
        const res = await axios.get(ipfsToHttp(tokenURI));
        metadata  = res.data;
      } catch { /* metadata fetch failed — certificate still valid on-chain */ }

      setResult({ owner, tokenURI, metadata });
    } catch (err) {
      setError("Verification error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>

      {/* ── Left: Input panel ── */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcon}>
            <ShieldCheck size={20} color="#6366f1" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Verify a Certificate</h2>
            <p style={styles.cardSubtitle}>Authenticate any certificate directly on the blockchain</p>
          </div>
        </div>

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <Hash size={13} style={{ color: "#6366f1" }} />
              Certificate Token ID
            </label>
            <div style={styles.inputRow}>
              <input
                style={styles.input}
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                required
              />
              <button
                style={{
                  ...styles.btn,
                  opacity: loading ? 0.7 : 1,
                  cursor : loading ? "not-allowed" : "pointer",
                }}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                  : <Search size={15} />}
                {loading ? "Verifying…" : "Verify"}
              </button>
            </div>
            <p style={styles.hint}>
              Enter the Token ID of the NFT certificate you want to verify.
            </p>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <ShieldX size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <p style={styles.errorTitle}>Certificate Not Found</p>
              <p style={styles.errorMsg}>{error}</p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={styles.howItWorks}>
          <p style={styles.howTitle}>How verification works</p>
          {[
            "The Token ID is looked up on the Ganache blockchain",
            "Ownership and existence are verified on-chain",
            "Certificate metadata is fetched from IPFS via Pinata",
          ].map((step, i) => (
            <div key={i} style={styles.howStep}>
              <span style={styles.howNum}>{i + 1}</span>
              <span style={styles.howText}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Result panel ── */}
      <div style={styles.resultPanel}>
        {!result && !loading && (
          <div style={styles.emptyResult}>
            <div style={styles.emptyIcon}>
              <ShieldCheck size={36} color="#94a3b8" />
            </div>
            <p style={styles.emptyTitle}>No certificate verified yet</p>
            <p style={styles.emptyText}>Enter a Token ID and click Verify to see results here.</p>
          </div>
        )}

        {loading && (
          <div style={styles.emptyResult}>
            <Loader2 size={32} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
            <p style={styles.emptyTitle}>Verifying on blockchain…</p>
            <p style={styles.emptyText}>Checking ownership and fetching IPFS metadata.</p>
          </div>
        )}

        {result && (
          <div style={styles.resultCard}>

            {/* Authentic badge */}
            <div style={styles.authenticBadge}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={styles.authenticText}>Authentic Certificate</span>
            </div>

            {/* Token ID */}
            <div style={styles.tokenRow}>
              <span style={styles.tokenLabel}>Token ID</span>
              <span style={styles.tokenValue}><Hash size={12} /> #{tokenId}</span>
            </div>

            {/* Metadata */}
            {result.metadata && (
              <>
                <h3 style={styles.certName}>{result.metadata.name}</h3>
                <p style={styles.certDesc}>{result.metadata.description}</p>
              </>
            )}

            {/* Attributes */}
            {result.metadata && Array.isArray(result.metadata.attributes) && (
              <div style={styles.attrList}>
                {result.metadata.attributes.map((attr, i) => (
                  <div key={i} style={styles.attr}>
                    <span style={styles.attrLabel}>
                      {traitIcon(attr.trait_type)}
                      {attr.trait_type}
                    </span>
                    <span style={styles.attrValue}>{attr.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Owner */}
            <div style={styles.ownerRow}>
              <span style={styles.ownerLabel}>
                <Wallet size={12} />
                Current Owner
              </span>
              <span style={styles.ownerValue}>{result.owner}</span>
            </div>

            {/* IPFS link */}
            <a
              href={ipfsToHttp(result.tokenURI)}
              target="_blank"
              rel="noreferrer"
              style={styles.ipfsBtn}
            >
              <ExternalLink size={13} />
              View metadata on IPFS
              <ChevronRight size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Styles ── */
const styles = {
  layout: {
    display            : "grid",
    gridTemplateColumns: "1fr 1fr",
    gap                : "24px",
    alignItems         : "start",
  },
  card: {
    background  : "#fff",
    borderRadius: "14px",
    padding     : "28px",
    boxShadow   : "0 2px 12px rgba(0,0,0,0.06)",
    border      : "1px solid #e2e8f0",
    display     : "flex",
    flexDirection: "column",
    gap         : "20px",
  },
  cardHeader: {
    display     : "flex",
    alignItems  : "center",
    gap         : "14px",
    paddingBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
  },
  cardIcon: {
    width         : "44px",
    height        : "44px",
    background    : "#e0e7ff",
    borderRadius  : "10px",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
    flexShrink    : 0,
  },
  cardTitle  : { fontSize: "17px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" },
  cardSubtitle: { fontSize: "13px", color: "#64748b" },
  form       : {},
  fieldGroup : { display: "flex", flexDirection: "column", gap: "8px" },
  label: {
    display     : "flex",
    alignItems  : "center",
    gap         : "5px",
    fontSize    : "12px",
    fontWeight  : "600",
    color       : "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  inputRow: { display: "flex", gap: "10px" },
  input: {
    flex        : 1,
    padding     : "11px 14px",
    borderRadius: "8px",
    border      : "1px solid #e2e8f0",
    fontSize    : "14px",
    color       : "#0f172a",
    outline     : "none",
    background  : "#f8fafc",
  },
  btn: {
    display        : "inline-flex",
    alignItems     : "center",
    gap            : "7px",
    background     : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color          : "#fff",
    border         : "none",
    padding        : "11px 20px",
    borderRadius   : "8px",
    fontSize       : "14px",
    fontWeight     : "600",
    whiteSpace     : "nowrap",
    boxShadow      : "0 2px 8px rgba(99,102,241,0.30)",
  },
  hint: {
    fontSize: "12px",
    color   : "#94a3b8",
    lineHeight: "1.4",
  },

  /* Error */
  errorBox: {
    display     : "flex",
    alignItems  : "flex-start",
    gap         : "10px",
    background  : "#fef2f2",
    border      : "1px solid #fecaca",
    borderRadius: "10px",
    padding     : "14px 16px",
  },
  errorTitle: { fontSize: "13px", fontWeight: "700", color: "#b91c1c", marginBottom: "3px" },
  errorMsg  : { fontSize: "13px", color: "#7f1d1d", lineHeight: "1.4" },

  /* How it works */
  howItWorks: {
    background  : "#f8fafc",
    borderRadius: "10px",
    padding     : "16px",
    border      : "1px solid #e2e8f0",
  },
  howTitle: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  howStep : { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" },
  howNum  : { width: "20px", height: "20px", background: "#e0e7ff", color: "#4f46e5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 },
  howText : { fontSize: "12px", color: "#64748b", lineHeight: "1.4", paddingTop: "2px" },

  /* Result panel */
  resultPanel: {
    background  : "#fff",
    borderRadius: "14px",
    border      : "1px solid #e2e8f0",
    boxShadow   : "0 2px 12px rgba(0,0,0,0.06)",
    overflow    : "hidden",
    minHeight   : "320px",
    display     : "flex",
    flexDirection: "column",
  },

  emptyResult: {
    flex          : 1,
    display       : "flex",
    flexDirection : "column",
    alignItems    : "center",
    justifyContent: "center",
    padding       : "48px 24px",
    textAlign     : "center",
    gap           : "10px",
  },
  emptyIcon   : { marginBottom: "4px" },
  emptyTitle  : { fontSize: "15px", fontWeight: "600", color: "#374151" },
  emptyText   : { fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" },

  /* Result card */
  resultCard: {
    flex         : 1,
    display      : "flex",
    flexDirection: "column",
    gap          : "0",
  },
  authenticBadge: {
    display       : "flex",
    alignItems    : "center",
    gap           : "8px",
    background    : "#f0fdf4",
    borderBottom  : "1px solid #d1fae5",
    padding       : "14px 20px",
  },
  authenticText: { fontSize: "14px", fontWeight: "700", color: "#065f46" },

  tokenRow : { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f1f5f9" },
  tokenLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" },
  tokenValue: { display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "700", color: "#0f172a" },

  certName : { fontSize: "16px", fontWeight: "700", color: "#0f172a", padding: "14px 20px 4px", lineHeight: "1.4" },
  certDesc : { fontSize: "12px", color: "#64748b", padding: "0 20px 12px", lineHeight: "1.5", borderBottom: "1px solid #f1f5f9" },

  attrList: { display: "flex", flexDirection: "column", gap: "1px", background: "#f8fafc" },
  attr: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    padding        : "9px 20px",
    background     : "#fff",
    borderBottom   : "1px solid #f1f5f9",
    gap            : "8px",
  },
  attrLabel: {
    display     : "flex",
    alignItems  : "center",
    gap         : "5px",
    fontSize    : "11px",
    color       : "#94a3b8",
    fontWeight  : "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    flexShrink  : 0,
  },
  attrValue: { fontSize: "13px", color: "#0f172a", fontWeight: "500", textAlign: "right", wordBreak: "break-all", maxWidth: "60%" },

  ownerRow  : { display: "flex", flexDirection: "column", gap: "4px", padding: "14px 20px", borderTop: "1px solid #f1f5f9" },
  ownerLabel: { display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px" },
  ownerValue: { fontSize: "12px", color: "#0f172a", fontFamily: "'SF Mono','Fira Code',monospace", wordBreak: "break-all" },

  ipfsBtn: {
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    gap            : "6px",
    padding        : "12px 20px",
    background     : "#f8fafc",
    borderTop      : "1px solid #e2e8f0",
    color          : "#6366f1",
    fontSize       : "13px",
    fontWeight     : "600",
    textDecoration : "none",
    transition     : "background 0.15s",
    marginTop      : "auto",
  },
};

export default VerifyCertificate;
