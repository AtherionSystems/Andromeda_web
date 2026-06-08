function Button({
  text,
  onClick,
  type = "button",
  disabled = false,
}: {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mt-5 w-full cursor-pointer rounded-md bg-[#C74634] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(199,70,52,0.5)] transition hover:bg-[#b83f2f] hover:shadow-[0_10px_20px_-12px_rgba(199,70,52,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C74634]/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:bg-[#C74634]"
    >
      {text}
    </button>
  );
}

export default Button;