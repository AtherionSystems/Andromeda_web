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
    <div className="flex items-center gap-1.5 border border-oracle-border rounded px-2 py-1 bg-[#f8fafa]">
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-none bg-transparent text-[12px] text-[#3a5a6a] outline-none w-[120px]"
      />
    </div>
  );
};

export default SearchInput;
