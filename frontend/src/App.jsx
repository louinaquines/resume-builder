import { useState } from "react";
import StepForm from "./components/StepForm";
import ResumePreview from "./components/ResumePreview";
import PDFExport from "./components/PDFExport";
import { generateResume } from "./api";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setMarkdown("");
    setError("");
    setLoading(true);
    try {
      await generateResume(
        formData,
        (chunk) => {
          console.log("CHUNK:", chunk); 
          setMarkdown(prev => prev + chunk);
        },
        () => setLoading(false)
      );
    } catch (e) {
      setError("Something went wrong. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Builder</h1>
          <p className="text-gray-500 mt-1 text-sm">Fill in your details — AI writes the rest.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <StepForm onSubmit={handleSubmit} loading={loading} />
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <ResumePreview markdown={markdown} loading={loading} />
            <PDFExport markdown={markdown} />
          </div>
        </div>
      </div>
    </div>
  );
}