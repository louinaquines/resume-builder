import { useState } from "react";
import { downloadResumePDF } from "../api";

export default function PDFExport({ markdown, data }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      await downloadResumePDF(data);
    } catch (e) {
      setError("Failed to download. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!markdown) return null;

  return (
    <div style={{ width: "490px" }}>
      {error && <p className="text-red-500 text-xs mb-1">{error}</p>}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
        {downloading ? "Preparing PDF..." : "⬇ Download as PDF"}
      </button>
    </div>
  );
}