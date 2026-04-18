import { cloneElement, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PDFExport({ children, markdown }) {
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save("resume.pdf");
    } finally {
      setDownloading(false);
    }
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {downloading ? "Preparing PDF..." : "⬇ Download as PDF"}
      </button>
      <div className="fixed -left-[99999px] top-0 pointer-events-none">
        <div ref={printRef}>
          {cloneElement(children, { scale: 1 })}
        </div>
      </div>
    </div>
  );
}