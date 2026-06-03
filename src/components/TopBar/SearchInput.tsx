import React from "react";
import { useTheme } from "../../contexts/useTheme";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
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
  inputClassName = "w-[120px]",
}) => {
  const { darkMode } = useTheme();

  return (
    <div
      className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors duration-200"
      style={{
        backgroundColor: darkMode ? "#1e293b" : "#f8fafa",
        border: `1px solid ${darkMode ? "#334155" : "#dbe7ea"}`,
      }}
    >
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border-none bg-transparent text-[12px] outline-none ${inputClassName}`}
        style={{ color: darkMode ? "#e2e8f0" : "#3a5a6a" }}
      />
    </div>
  );
};

export default SearchInput;
