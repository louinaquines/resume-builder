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
  body { width: 816px; font-family: Georgia, serif; background: white; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  .no-print {
    position: fixed; top: 0; left: 0; right: 0;
    background: #1e293b; color: white;
    padding: 12px 20px; font-family: sans-serif;
    font-size: 14px; display: flex; align-items: center;
    justify-content: space-between; z-index: 9999;
  }
  .no-print button {
    background: #6366f1; color: white; border: none;
    padding: 8px 20px; border-radius: 8px; font-size: 14px;
    cursor: pointer; font-weight: bold;
  }
  .resume-wrapper { padding-top: 52px; }
  @media print { .resume-wrapper { padding-top: 0; } }
</style>
</head>
<body>
<div class="no-print">
  <span>📄 To save as PDF: Click the button → set Destination to <strong>"Save as PDF"</strong> → click Save</span>
  <button onclick="window.print()">⬇ Save as PDF</button>
</div>
<div class="resume-wrapper">
${el.innerHTML}
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 600);
  };
</script>
</body>
</html>`);
    newTab.document.close();
    setTimeout(() => setDownloading(false), 1000);
  };

  if (!markdown) return null;

  return (
    <div style={{ width: "490px" }}>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50">
        {downloading ? "Opening..." : "⬇ Download as PDF"}
      </button>
      <p className="text-xs text-slate-500 mt-2 text-center">
        A print dialog will open → set destination to <strong className="text-slate-400">Save as PDF</strong>
      </p>
    </div>
  );
}