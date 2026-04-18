import { useRef } from "react";

export default function PDFExport({ children, markdown }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const content = printRef.current?.innerHTML;
    if (!content) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, serif; }
            @page { size: letter; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-2xl">
      <button onClick={handlePrint}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
        ⬇ Download as PDF
      </button>
      <div className="hidden" ref={printRef}>
        {children}
      </div>
    </div>
  );
}