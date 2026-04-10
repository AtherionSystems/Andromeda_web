import React from "react";

const LINKS = ["COMPLIANCE", "PRIVACY POLICY", "TERMS OF SERVICE"];

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 24px",
        background: "#f8fafa",
        borderTop: "0.5px solid rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10, color: "#8aaabb", letterSpacing: "0.5px" }}>
        © 2024 ATHERION SYSTEMS. ALL RIGHTS RESERVED.
      </span>

      <nav style={{ display: "flex", gap: 16 }}>
        {LINKS.map((link) => (
          <button
            key={link}
            style={{
              fontSize: 10,
              color: "#8aaabb",
              letterSpacing: "0.5px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {link}
          </button>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
