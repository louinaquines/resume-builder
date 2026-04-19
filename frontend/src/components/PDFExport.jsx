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
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition">
        {downloading ? "Preparing PDF..." : "⬇ Download as PDF"}
      </button>
    </div>
  );
}