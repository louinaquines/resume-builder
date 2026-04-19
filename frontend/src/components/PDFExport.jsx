import { useState } from "react";

export default function PDFExport({ markdown, data }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    const el = document.getElementById("resume-print-target");
    if (!el) return;
    setDownloading(true);

    const newTab = window.open("", "_blank");
    newTab.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Resume - ${data?.full_name || "Resume"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: letter; margin: 0; }
  body { width: 816px; font-family: Georgia, serif; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
${el.innerHTML}
</body>
</html>`);
    newTab.document.close();
    newTab.focus();
    setTimeout(() => {
      newTab.print();
      setDownloading(false);
    }, 800);
  };

  if (!markdown) return null;

  return (
    <div style={{ width: "490px" }}>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50">
        {downloading ? "Opening PDF..." : "⬇ Download as PDF"}
      </button>
      <p className="text-xs text-slate-500 mt-2 text-center">
        In the print dialog → set destination to <strong className="text-slate-400">Save as PDF</strong>
      </p>
    </div>
  );
}