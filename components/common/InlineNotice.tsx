type Props = {
  message?: string | null;
  tone?: "error" | "success" | "info";
  className?: string;
};

export default function InlineNotice({
  message,
  tone = "info",
  className = "",
}: Props) {
  if (!message) return null;

  const toneClass =
    tone === "error"
      ? "border-[#ebc6c6] bg-[#fdf4f4] text-[#8a3d3d]"
      : tone === "success"
      ? "border-[#d9d1c2] bg-[#f8f4ed] text-[#2f2417]"
      : "border-[#e7dccd] bg-[#fcfaf6] text-[#5c5144]";

  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 text-sm leading-6",
        toneClass,
        className,
      ].join(" ")}
    >
      {message}
    </div>
  );
}