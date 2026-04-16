function Button({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-5 w-full cursor-pointer rounded-md bg-[#C74634] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b83f2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C74634]/50"
    >
      {text}
    </button>
  );
}

export default Button;