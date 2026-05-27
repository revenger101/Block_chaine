import React, { useState } from "react";
import { getSigner, getContract } from "../utils/contract";
import { uploadMetadataToIPFS }   from "../utils/pinata";
import {
  FileBadge,
  User,
  BookOpen,
  Calendar,
  Wallet,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Hash,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  { key: "ipfs",    label: "Uploading metadata to IPFS" },
  { key: "tx",      label: "Sending transaction to blockchain" },
  { key: "confirm", label: "Waiting for confirmation" },
];

const IssueCertificate = () => {
  const [studentAddress, setStudentAddress] = useState("");
  const [studentName,    setStudentName]    = useState("");
  const [courseName,     setCourseName]     = useState("");
  const [issueDate,      setIssueDate]      = useState("");
  const [status,         setStatus]         = useState(null); // null | "loading" | "success" | "error"
  const [step,           setStep]           = useState(null); // "ipfs" | "tx" | "confirm"
  const [result,         setResult]         = useState(null); // { tokenId, ipfsHash }
  const [errorMsg,       setErrorMsg]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      // 1. Upload to IPFS
      setStep("ipfs");
      const metadata = {
        name       : `Certificate — ${courseName}`,
        description: `This NFT certifies that ${studentName} completed the course: ${courseName}`,
        attributes : [
          { trait_type: "Student Name",   value: studentName },
          { trait_type: "Course",         value: courseName },
          { trait_type: "Issue Date",     value: issueDate },
          { trait_type: "Wallet Address", value: studentAddress },
        ],
      };
      const ipfsHash = await uploadMetadataToIPFS(metadata);
      const tokenURI = `ipfs://${ipfsHash}`;

      // 2. Send transaction
      setStep("tx");
      const signer   = await getSigner();
      const contract = getContract(signer);
      const tx       = await contract.mintCertificate(studentAddress, tokenURI);

      // 3. Wait for confirmation
      setStep("confirm");
      const receipt  = await tx.wait();

      // 4. Extract tokenId
      const event   = receipt.events?.find((e) => e.event === "CertificateMinted");
      const tokenId = event?.args?.tokenId?.toString() ?? "?";

      setStatus("success");
      setResult({ tokenId, ipfsHash });

      // Reset form
      setStudentAddress("");
      setStudentName("");
      setCourseName("");
      setIssueDate("");
      setStep(null);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStep(null);
      setErrorMsg(err.reason ?? err.message);
    }
  };

  const isLoading = status === "loading";

  return (
    <div style={styles.layout}>

      {/* ── Left: Form ── */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcon}>
            <FileBadge size={20} color="#6366f1" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Issue a Certificate</h2>
            <p style={styles.cardSubtitle}>Mint a verifiable NFT certificate on-chain</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Wallet Address */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <Wallet size={13} style={styles.labelIcon} />
              Student Wallet Address
            </label>
            <input
              style={styles.input}
              type="text"
              placeholder="0x..."
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              required
            />
          </div>

          {/* Two columns: name + date */}
          <div style={styles.row2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <User size={13} style={styles.labelIcon} />
                Student Name
              </label>
              <input
                style={styles.input}
                type="text"
                placeholder="Alice Martin"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Calendar size={13} style={styles.labelIcon} />
                Issue Date
              </label>
              <input
                style={styles.input}
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Course */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <BookOpen size={13} style={styles.labelIcon} />
              Course Name
            </label>
            <input
              style={styles.input}
              type="text"
              placeholder="Blockchain Development"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>

          <button
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.75 : 1,
              cursor : isLoading ? "not-allowed" : "pointer",
            }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
              : <><Upload size={16} /> Issue Certificate</>}
          </button>
        </form>
      </div>

      {/* ── Right: Status / Result ── */}
      <div style={styles.sidebar}>

        {/* Steps tracker */}
        <div style={styles.stepsCard}>
          <p style={styles.stepsTitle}>Transaction Steps</p>
          <div style={styles.steps}>
            {STEPS.map((s, i) => {
              const currentIdx = STEPS.findIndex((x) => x.key === step);
              const done    = status === "success" || (isLoading && i < currentIdx);
              const active  = isLoading && s.key === step;
              const waiting = !isLoading && status === null;

              return (
                <div key={s.key} style={styles.stepRow}>
                  <div style={{
                    ...styles.stepDot,
                    background: done   ? "#10b981"
                              : active ? "#6366f1"
                              : "#e2e8f0",
                    boxShadow : active ? "0 0 0 3px #e0e7ff" : "none",
                  }}>
                    {done   && <CheckCircle2 size={10} color="#fff" />}
                    {active && <Loader2 size={10} color="#fff" style={{ animation: "spin 1s linear infinite" }} />}
                    {!done && !active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", display: "block" }} />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      ...styles.stepLine,
                      background: done ? "#10b981" : "#e2e8f0",
                    }} />
                  )}
                  <span style={{
                    ...styles.stepLabel,
                    color     : done ? "#065f46" : active ? "#4338ca" : "#94a3b8",
                    fontWeight: active || done ? "600" : "400",
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success card */}
        {status === "success" && result && (
          <div style={styles.successCard}>
            <div style={styles.successHeader}>
              <CheckCircle2 size={22} color="#10b981" />
              <span style={styles.successTitle}>Certificate Issued!</span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Token ID</span>
              <span style={styles.resultValue}>
                <Hash size={12} /> #{result.tokenId}
              </span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>IPFS Hash</span>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`}
                target="_blank"
                rel="noreferrer"
                style={styles.resultLink}
              >
                {result.ipfsHash.slice(0, 16)}… <ArrowRight size={11} />
              </a>
            </div>
          </div>
        )}

        {/* Error card */}
        {status === "error" && (
          <div style={styles.errorCard}>
            <div style={styles.errorHeader}>
              <XCircle size={18} color="#ef4444" />
              <span style={styles.errorTitle}>Transaction Failed</span>
            </div>
            <p style={styles.errorMsg}>{errorMsg}</p>
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
    gridTemplateColumns: "1fr 320px",
    gap                : "24px",
    alignItems         : "start",
  },
  card: {
    background  : "#fff",
    borderRadius: "14px",
    padding     : "28px",
    boxShadow   : "0 2px 12px rgba(0,0,0,0.06)",
    border      : "1px solid #e2e8f0",
  },
  cardHeader: {
    display      : "flex",
    alignItems   : "center",
    gap          : "14px",
    marginBottom : "24px",
    paddingBottom: "20px",
    borderBottom : "1px solid #f1f5f9",
  },
  cardIcon: {
    width          : "44px",
    height         : "44px",
    background     : "#e0e7ff",
    borderRadius   : "10px",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    flexShrink     : 0,
  },
  cardTitle  : { fontSize: "17px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" },
  cardSubtitle: { fontSize: "13px", color: "#64748b" },
  form       : { display: "flex", flexDirection: "column", gap: "16px" },
  row2       : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  fieldGroup : { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    display   : "flex",
    alignItems: "center",
    gap       : "5px",
    fontSize  : "12px",
    fontWeight: "600",
    color     : "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  labelIcon  : { color: "#6366f1" },
  input: {
    padding     : "10px 14px",
    borderRadius: "8px",
    border      : "1px solid #e2e8f0",
    fontSize    : "14px",
    color       : "#0f172a",
    outline     : "none",
    background  : "#f8fafc",
    transition  : "border-color 0.15s, box-shadow 0.15s",
  },
  submitBtn: {
    display        : "inline-flex",
    alignItems     : "center",
    justifyContent : "center",
    gap            : "8px",
    marginTop      : "4px",
    background     : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color          : "#fff",
    border         : "none",
    padding        : "13px",
    borderRadius   : "10px",
    fontSize       : "14px",
    fontWeight     : "600",
    boxShadow      : "0 4px 14px rgba(99,102,241,0.35)",
    transition     : "transform 0.1s, box-shadow 0.15s",
  },

  /* Sidebar */
  sidebar     : { display: "flex", flexDirection: "column", gap: "16px" },
  stepsCard: {
    background  : "#fff",
    borderRadius: "14px",
    padding     : "20px",
    border      : "1px solid #e2e8f0",
    boxShadow   : "0 2px 12px rgba(0,0,0,0.06)",
  },
  stepsTitle  : { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" },
  steps       : { display: "flex", flexDirection: "column", gap: "0" },
  stepRow     : { display: "flex", alignItems: "flex-start", gap: "12px", position: "relative", paddingBottom: "16px" },
  stepDot: {
    width          : "22px",
    height         : "22px",
    borderRadius   : "50%",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    flexShrink     : 0,
    transition     : "background 0.2s, box-shadow 0.2s",
    zIndex         : 1,
  },
  stepLine: {
    position  : "absolute",
    left      : "10px",
    top       : "22px",
    width     : "2px",
    height    : "calc(100% - 6px)",
    transition: "background 0.2s",
  },
  stepLabel  : { fontSize: "13px", paddingTop: "3px", transition: "color 0.2s" },

  /* Success / Error */
  successCard: {
    background  : "#f0fdf4",
    border      : "1px solid #bbf7d0",
    borderRadius: "12px",
    padding     : "18px",
  },
  successHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" },
  successTitle : { fontSize: "15px", fontWeight: "700", color: "#065f46" },
  resultRow: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "center",
    padding        : "8px 10px",
    background     : "#fff",
    borderRadius   : "6px",
    marginBottom   : "6px",
    border         : "1px solid #d1fae5",
  },
  resultLabel: { fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" },
  resultValue: { display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  resultLink : { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", color: "#4f46e5", textDecoration: "none" },

  errorCard  : { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px" },
  errorHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  errorTitle : { fontSize: "14px", fontWeight: "700", color: "#b91c1c" },
  errorMsg   : { fontSize: "13px", color: "#7f1d1d", lineHeight: "1.5", wordBreak: "break-word" },
};

export default IssueCertificate;
