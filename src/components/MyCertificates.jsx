import React, { useState, useEffect, useCallback } from "react";
import { getProvider, getContract } from "../utils/contract";
import axios from "axios";
import {
  GraduationCap,
  RefreshCw,
  ExternalLink,
  Hash,
  BookOpen,
  User,
  Calendar,
  Wallet,
  Loader2,
  FileX,
} from "lucide-react";

const ipfsToHttp = (uri) =>
  uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : uri;

/* Map trait_type → icon */
const traitIcon = (trait) => {
  const t = trait?.toLowerCase() ?? "";
  if (t.includes("student") || t.includes("name"))   return <User     size={11} />;
  if (t.includes("course"))                           return <BookOpen size={11} />;
  if (t.includes("date"))                             return <Calendar size={11} />;
  if (t.includes("wallet") || t.includes("address")) return <Wallet   size={11} />;
  return null;
};

const MyCertificates = ({ account }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const loadCertificates = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      const contract = getContract(provider);
      const tokenIds = await contract.getCertificatesByOwner(account);

      const certs = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await contract.tokenURI(tokenId);
            const httpURL  = ipfsToHttp(tokenURI);
            const response = await axios.get(httpURL);
            return { tokenId: tokenId.toString(), metadata: response.data, tokenURI };
          } catch {
            return { tokenId: tokenId.toString(), metadata: null, tokenURI: "" };
          }
        })
      );
      setCertificates(certs);
    } catch (err) {
      setError("Failed to load certificates: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { loadCertificates(); }, [loadCertificates]);

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}><GraduationCap size={20} color="#6366f1" /></div>
          <div>
            <h2 style={styles.title}>My Certificates</h2>
            <p style={styles.subtitle}>
              {certificates.length > 0
                ? `${certificates.length} certificate${certificates.length > 1 ? "s" : ""} found`
                : "Your blockchain-verified credentials"}
            </p>
          </div>
        </div>
        <button style={styles.refreshBtn} onClick={loadCertificates} disabled={loading}>
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && certificates.length === 0 && (
        <div style={styles.loadingWrap}>
          <Loader2 size={28} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
          <p style={styles.loadingText}>Fetching your certificates from the blockchain…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && certificates.length === 0 && !error && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}><FileX size={36} color="#94a3b8" /></div>
          <p style={styles.emptyTitle}>No certificates yet</p>
          <p style={styles.emptySubtitle}>
            Certificates issued to your address will appear here.
          </p>
        </div>
      )}

      {/* Grid */}
      <div style={styles.grid}>
        {certificates.map(({ tokenId, metadata, tokenURI }) => (
          <CertCard key={tokenId} tokenId={tokenId} metadata={metadata} tokenURI={tokenURI} />
        ))}
      </div>
    </div>
  );
};

/* ── Individual certificate card ── */
const CertCard = ({ tokenId, metadata, tokenURI }) => (
  <div style={cardStyles.card}>

    {/* Decorative top stripe */}
    <div style={cardStyles.stripe} />

    {/* Header */}
    <div style={cardStyles.header}>
      <span style={cardStyles.tokenBadge}>
        <Hash size={10} /> Token #{tokenId}
      </span>
      {tokenURI && (
        <a
          href={ipfsToHttp(tokenURI)}
          target="_blank"
          rel="noreferrer"
          style={cardStyles.ipfsLink}
          title="View on IPFS"
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>

    {metadata ? (
      <>
        <h3 style={cardStyles.title}>{metadata.name ?? "Certificate"}</h3>
        <p style={cardStyles.description}>{metadata.description}</p>

        {Array.isArray(metadata.attributes) && (
          <div style={cardStyles.attrs}>
            {metadata.attributes.map((attr, i) => (
              <div key={i} style={cardStyles.attr}>
                <span style={cardStyles.attrLabel}>
                  {traitIcon(attr.trait_type)}
                  {attr.trait_type}
                </span>
                <span style={cardStyles.attrValue}>{attr.value}</span>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "8px" }}>
        Metadata unavailable — certificate is still valid on-chain.
      </p>
    )}
  </div>
);

const ipfsToHttpLocal = (uri) =>
  uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : uri;

/* ── Styles ── */
const styles = {
  wrapper   : { width: "100%" },
  header    : { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "12px" },
  titleRow  : { display: "flex", alignItems: "center", gap: "12px" },
  titleIcon : { width: "44px", height: "44px", background: "#e0e7ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title     : { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" },
  subtitle  : { fontSize: "13px", color: "#64748b" },
  refreshBtn: {
    display       : "inline-flex",
    alignItems    : "center",
    gap           : "6px",
    background    : "#fff",
    border        : "1px solid #e2e8f0",
    padding       : "8px 16px",
    borderRadius  : "8px",
    cursor        : "pointer",
    fontSize      : "13px",
    fontWeight    : "600",
    color         : "#374151",
    boxShadow     : "0 1px 3px rgba(0,0,0,0.05)",
    transition    : "background 0.15s",
    flexShrink    : 0,
  },
  error: {
    background  : "#fef2f2",
    border      : "1px solid #fecaca",
    color       : "#b91c1c",
    padding     : "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize    : "14px",
  },
  loadingWrap: {
    display       : "flex",
    flexDirection : "column",
    alignItems    : "center",
    padding       : "60px 20px",
    gap           : "14px",
  },
  loadingText: { fontSize: "14px", color: "#64748b" },
  empty: {
    background  : "#fff",
    border      : "2px dashed #e2e8f0",
    borderRadius: "14px",
    padding     : "60px 40px",
    textAlign   : "center",
  },
  emptyIcon    : { marginBottom: "14px" },
  emptyTitle   : { fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  emptySubtitle: { fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" },
  grid: {
    display            : "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap                : "18px",
  },
};

const cardStyles = {
  card: {
    background  : "#fff",
    borderRadius: "14px",
    overflow    : "hidden",
    boxShadow   : "0 2px 12px rgba(0,0,0,0.07)",
    border      : "1px solid #e2e8f0",
    display     : "flex",
    flexDirection: "column",
    transition  : "box-shadow 0.2s, transform 0.15s",
  },
  stripe: {
    height    : "4px",
    background: "linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)",
  },
  header: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    padding        : "16px 18px 0",
    marginBottom   : "10px",
  },
  tokenBadge: {
    display     : "inline-flex",
    alignItems  : "center",
    gap         : "4px",
    background  : "#e0e7ff",
    color       : "#4338ca",
    padding     : "4px 10px",
    borderRadius: "20px",
    fontSize    : "11px",
    fontWeight  : "700",
  },
  ipfsLink: {
    color     : "#6366f1",
    display   : "flex",
    alignItems: "center",
    transition: "color 0.15s",
  },
  title: {
    fontSize    : "15px",
    fontWeight  : "700",
    color       : "#0f172a",
    padding     : "0 18px",
    marginBottom: "6px",
    lineHeight  : "1.4",
  },
  description: {
    fontSize    : "12px",
    color       : "#64748b",
    padding     : "0 18px",
    marginBottom: "14px",
    lineHeight  : "1.5",
  },
  attrs: {
    borderTop  : "1px solid #f1f5f9",
    padding    : "12px 18px 16px",
    display    : "flex",
    flexDirection: "column",
    gap        : "6px",
  },
  attr: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    background     : "#f8fafc",
    padding        : "7px 10px",
    borderRadius   : "6px",
    gap            : "8px",
  },
  attrLabel: {
    display   : "flex",
    alignItems: "center",
    gap       : "5px",
    fontSize  : "11px",
    color     : "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    flexShrink: 0,
  },
  attrValue: {
    fontSize  : "12px",
    color     : "#0f172a",
    fontWeight: "500",
    textAlign : "right",
    wordBreak : "break-all",
    maxWidth  : "55%",
  },
};

export default MyCertificates;
