import { useState } from "react";
import StepForm from "./components/StepForm";
import ResumePreview from "./components/ResumePreview";
import PDFExport from "./components/PDFExport";
import { generateResume } from "./api";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);

  const handleSubmit = async (data) => {
    console.log("SUBMITTING:", JSON.stringify(data));
    setMarkdown("");
    setError("");
    setLoading(true);
    setFormData(data);
    try {
      await generateResume(
        data,
        (chunk) => setMarkdown(prev => prev + chunk),
        () => setLoading(false)
      );
    } catch (e) {
      setError("Something went wrong. Is the backend running?");
      setLoading(false);
    }
  };

  const preview = (
    <div id="resume-live">
      <ResumePreview data={formData} markdown={markdown} loading={loading} />
    </div>
  );
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1438] via-[#0a0a0f] to-[#0a0a0f] py-12 px-4 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          <h1 className="relative text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight mb-4 drop-shadow-md">
            Build Your Resume with AI
          </h1>
          <p className="relative text-slate-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Fill in your details — AI writes the rest. <span className="font-medium text-white">Download in seconds.</span>
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <StepForm onSubmit={handleSubmit} loading={loading} />
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {preview}
            <PDFExport markdown={markdown} data={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}