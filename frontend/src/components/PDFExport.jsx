import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useReactToPrint } from "react-to-print";

export default function PDFExport({ markdown }) {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "resume",
  });

  if (!markdown) return null;

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={handlePrint}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
        ⬇ Download as PDF
      </button>
      <div className="hidden">
        <div ref={printRef} className="p-10 prose prose-sm max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}