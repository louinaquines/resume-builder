import { useState } from "react";
import ChatForm from "./components/ChatForm";
import ResumePreview from "./components/ResumePreview";
import PDFExport from "./components/PDFExport";
import { generateResume } from "./api";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);

  const handleResumeReady = async (data) => {
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
      setError("Something went wrong generating the resume.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#170f2f] via-[#0a0a0f] to-[#0a0a0f] py-12 px-4 selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-0"></div>

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight mb-4 drop-shadow-md">
          Build Your Resume <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">with AI</span>
        </h1>
        <p className="text-slate-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
          Chat your details and let AI write the rest! <strong className="text-white font-medium">Download in seconds.</strong>
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start justify-center relative z-10">
        {/* Chat Panel */}
        <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <div className="px-5 py-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-sm text-slate-200 font-semibold tracking-wide uppercase">AI Resume Assistant</span>
            </div>
          </div>
          <ChatForm onResumeReady={handleResumeReady} loading={loading} />
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col gap-5 w-full max-w-2xl relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
              {error}
            </div>
          )}
          <div id="resume-live" className="w-fit mx-auto lg:mx-0 transition-all duration-500 ease-out">
            <ResumePreview data={formData} markdown={markdown} loading={loading} />
          </div>
          <div className="max-w-[490px]">
            <PDFExport markdown={markdown} data={formData} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 pt-8 pb-6 text-center text-slate-500 text-sm relative z-10 max-w-6xl mx-auto">
        <p>Made by <span className="text-slate-300 font-medium hover:text-indigo-400 transition-colors cursor-default">Loui Naquines</span>. All rights reserved.</p>
      </footer>
    </div>
  );
}