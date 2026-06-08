import React, { useState } from "react";
import { useTheme } from "../../contexts/useTheme";
import LegalModal from "./LegalModal";
import { COMPLIANCE_MD, PRIVACY_MD, TERMS_MD } from "../../content/legal";

const LINKS = [
  { label: "COMPLIANCE", content: COMPLIANCE_MD },
  { label: "PRIVACY POLICY", content: PRIVACY_MD },
  { label: "TERMS OF SERVICE", content: TERMS_MD },
] as const;

const Footer: React.FC = () => {
  const { darkMode } = useTheme();
  const [openDoc, setOpenDoc] = useState<(typeof LINKS)[number] | null>(null);

  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 24px",
        background: darkMode ? "#0f172a" : "#f8fafa",
        borderTop: `0.5px solid ${darkMode ? "#1e293b" : "rgba(0,0,0,0.08)"}`,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10, color: darkMode ? "#94a3b8" : "#8aaabb", letterSpacing: "0.5px" }}>
        © 2026 ATHERION SYSTEMS. ALL RIGHTS RESERVED.
      </span>

      <nav style={{ display: "flex", gap: 16 }}>
        {LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => setOpenDoc(link)}
            style={{
              fontSize: 10,
              color: darkMode ? "#94a3b8" : "#8aaabb",
              letterSpacing: "0.5px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            className="dark:!text-slate-400"
          >
            {link.label}
          </button>
        ))}
      </nav>

      <LegalModal
        isOpen={openDoc !== null}
        onClose={() => setOpenDoc(null)}
        content={openDoc?.content ?? ""}
      />
    </footer>
  );
};

export default Footer;
