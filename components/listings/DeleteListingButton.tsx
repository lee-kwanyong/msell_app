"use client";

type DeleteListingButtonProps = {
  label?: string;
};

export default function DeleteListingButton({
  label = "글 삭제",
}: DeleteListingButtonProps) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm("정말 삭제하시겠습니까?");
        if (!ok) {
          e.preventDefault();
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minWidth: 130,
        height: 48,
        padding: "0 18px",
        borderRadius: 999,
        border: "1px solid #d7b9b4",
        background: "#fff4f2",
        color: "#8b2f23",
        fontSize: 14,
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}