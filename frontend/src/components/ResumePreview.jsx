import ReactMarkdown from "react-markdown";

export default function ResumePreview({ markdown, loading }) {
  if (!markdown && !loading) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl prose prose-sm prose-indigo max-w-none">
      {loading && !markdown && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="animate-pulse">✦</span> Generating your resume...
        </div>
      )}
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}