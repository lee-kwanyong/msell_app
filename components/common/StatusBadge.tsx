import {
  getDealStatusLabel,
  getListingStatusLabel,
  getStatusTone,
} from "@/lib/ui/labels";

type Props = {
  type: "listing" | "deal";
  status?: string | null;
  className?: string;
};

function getToneClass(status?: string | null) {
  const tone = getStatusTone(status);

  switch (tone) {
    case "success":
      return "bg-[rgba(47,36,23,0.08)] text-[#2f2417] border-[rgba(47,36,23,0.18)]";
    case "warning":
      return "bg-[#f3eadc] text-[#5b4630] border-[#e3d3bc]";
    case "danger":
      return "bg-[#f8e7e7] text-[#8a3d3d] border-[#ebc6c6]";
    case "neutral":
      return "bg-[#f3efe8] text-[#6b6257] border-[#e3dbcf]";
    case "subtle":
    default:
      return "bg-[#faf7f2] text-[#7a7064] border-[#ece3d8]";
  }
}

export default function StatusBadge({ type, status, className = "" }: Props) {
  const label =
    type === "listing"
      ? getListingStatusLabel(status)
      : getDealStatusLabel(status);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold leading-none",
        getToneClass(status),
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}