/**
 * components/OutreachButton.jsx
 * -----------------------------------------------------------------------
 * Self-contained "Generate Outreach Email" control. Unlike the original
 * monolith (which used a single app-wide `generating` flag), this
 * component owns its own loading/email/open state and calls
 * services/claudeApi directly — so multiple outreach buttons on screen
 * never block or interfere with each other.
 */
import React, { useState } from "react";
import { generateOutreach } from "../services/claudeApi";

export default function OutreachButton({ prospect, outreachContext }) {
  const [email, setEmail] = useState(null);
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (email) {
      setOpen((o) => !o);
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const result = await generateOutreach(prospect, outreachContext);
      setEmail(result);
      setOpen(true);
    } catch (err) {
      setError(err.message || "Couldn't generate an outreach email. Try again.");
    }
    setGenerating(false);
  };

  const handleOpenMailClient = () => {
    if (!email) return;
    const [subject, ...bodyLines] = email.split("\n");
    const body = bodyLines.join("\n").trim();
    const mailto = `mailto:${prospect.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const handleCopy = () => {
    if (email) navigator.clipboard.writeText(email);
  };

  return (
    <>
      <button
        className="btn btn-s"
        onClick={handleGenerate}
        disabled={generating}
        style={{ fontSize: 13 }}
      >
        {generating ? "✍ Writing..." : email ? "✉ View Outreach Email" : "✉ Generate Outreach Email"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{error}</p>
      )}

      {open && email && (
        <div
          style={{
            marginTop: 16,
            background: "#0a0a0f",
            border: "1px solid #22d3ee33",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#22d3ee",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Draft Email
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleOpenMailClient}
                style={{
                  background: "#1e293b",
                  border: "none",
                  color: "#e2e8f0",
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Open in Email
              </button>
              <button
                onClick={handleCopy}
                style={{
                  background: "transparent",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 1.7,
              fontFamily: "inherit",
            }}
          >
            {email}
          </pre>
        </div>
      )}
    </>
  );
}
