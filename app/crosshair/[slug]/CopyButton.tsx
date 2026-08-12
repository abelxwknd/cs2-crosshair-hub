"use client";

export default function CopyButton({
  code,
}: {
  code: string;
}) {
  const copy = () => {
    navigator.clipboard.writeText(code);
    alert("Crosshair kopyalandı!");
  };

  return (
    <button
      onClick={copy}
      className="
        mt-5
        w-full
        bg-red-600
        hover:bg-red-700
        py-3
        rounded-xl
        font-bold
        transition
      "
    >
      📋 Kodu Kopyala
    </button>
  );
}