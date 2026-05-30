import React from "react";
import { useTheme } from "../../contexts/useTheme";

const LINKS = ["COMPLIANCE", "PRIVACY POLICY", "TERMS OF SERVICE"];

const Footer: React.FC = () => {
  const { darkMode } = useTheme();

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
            key={link}
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
            {link}
          </button>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
