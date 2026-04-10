import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="#8aaabb"
    strokeWidth="2"
  >
    <circle cx="7" cy="7" r="5" />
    <path d="M11 11l3 3" />
  </svg>
);

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search Project...",
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: "0.5px solid #cdd8db",
        borderRadius: 4,
        padding: "4px 8px",
        background: "#f8fafa",
      }}
    >
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "none",
          background: "transparent",
          fontSize: 12,
          color: "#3a5a6a",
          outline: "none",
          width: 120,
        }}
      />
    </div>
  );
};

export default SearchInput;
