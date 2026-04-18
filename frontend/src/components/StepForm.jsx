import { useState } from "react";

const TONES = ["Professional", "Modern", "Creative", "Executive"];

const emptyJob = () => ({ company: "", role: "", duration: "", responsibilities: "" });
const emptyEdu = () => ({ school: "", degree: "", year: "" });

export default function StepForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", location: "", linkedin: "",
    job_title: "", job_description: "", tone: "Professional",
    work_experience: [emptyJob()],
    education: [emptyEdu()],
    skills: "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const setJob = (i, field, value) => {
    const updated = [...form.work_experience];
    updated[i] = { ...updated[i], [field]: value };
    set("work_experience", updated);
  };

  const setEdu = (i, field, value) => {
    const updated = [...form.education];
    updated[i] = { ...updated[i], [field]: value };
    set("education", updated);
  };

  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const label = "block text-sm font-medium text-gray-700 mb-1";
  const section = "space-y-4";

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3,4].map(n => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${step >= n ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              {n}
            </div>
            {n < 4 && <div className={`flex-1 h-1 rounded ${step > n ? "bg-indigo-600" : "bg-gray-200"}`}/>}
          </div>
        ))}
      </div>

      {/* Step 1 — Personal Info */}
      {step === 1 && (
        <div className={section}>
          <h2 className="font-semibold text-gray-800 text-lg">Personal Info</h2>
          {[
            ["Full Name", "full_name", "text"],
            ["Email", "email", "email"],
            ["Phone", "phone", "text"],
            ["Location", "location", "text"],
            ["LinkedIn URL", "linkedin", "text"],
          ].map(([lbl, field, type]) => (
            <div key={field}>
              <label className={label}>{lbl}</label>
              <input type={type} className={input} value={form[field]}
                onChange={e => set(field, e.target.value)} />
            </div>
          ))}
        </div>
      )}

      {/* Step 2 — Work Experience */}
      {step === 2 && (
        <div className={section}>
          <h2 className="font-semibold text-gray-800 text-lg">Work Experience</h2>
          {form.work_experience.map((job, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-500 uppercase">Job {i + 1}</p>
              {[["Company", "company"], ["Role / Title", "role"], ["Duration (e.g. Jan 2022 – Mar 2024)", "duration"]].map(([lbl, field]) => (
                <div key={field}>
                  <label className={label}>{lbl}</label>
                  <input className={input} value={job[field]} onChange={e => setJob(i, field, e.target.value)} />
                </div>
              ))}
              <div>
                <label className={label}>Responsibilities & Achievements</label>
                <textarea className={input + " h-24 resize-none"} value={job.responsibilities}
                  onChange={e => setJob(i, "responsibilities", e.target.value)} />
              </div>
              {form.work_experience.length > 1 && (
                <button className="text-xs text-red-400 hover:text-red-600"
                  onClick={() => set("work_experience", form.work_experience.filter((_, j) => j !== i))}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline"
            onClick={() => set("work_experience", [...form.work_experience, emptyJob()])}>
            + Add another job
          </button>
        </div>
      )}

      {/* Step 3 — Education & Skills */}
      {step === 3 && (
        <div className={section}>
          <h2 className="font-semibold text-gray-800 text-lg">Education & Skills</h2>
          {form.education.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-500 uppercase">Education {i + 1}</p>
              {[["School / University", "school"], ["Degree", "degree"], ["Year", "year"]].map(([lbl, field]) => (
                <div key={field}>
                  <label className={label}>{lbl}</label>
                  <input className={input} value={edu[field]} onChange={e => setEdu(i, field, e.target.value)} />
                </div>
              ))}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline"
            onClick={() => set("education", [...form.education, emptyEdu()])}>
            + Add another education
          </button>
          <div>
            <label className={label}>Skills (comma separated)</label>
            <textarea className={input + " h-20 resize-none"} value={form.skills}
              onChange={e => set("skills", e.target.value)}
              placeholder="e.g. React, Node.js, Python, Project Management" />
          </div>
        </div>
      )}

      {/* Step 4 — Preferences */}
      {step === 4 && (
        <div className={section}>
          <h2 className="font-semibold text-gray-800 text-lg">Target Role & Tone</h2>
          <div>
            <label className={label}>Target Job Title</label>
            <input className={input} value={form.job_title} onChange={e => set("job_title", e.target.value)}
              placeholder="e.g. Senior Frontend Developer" />
          </div>
          <div>
            <label className={label}>Job Description (paste or summarize)</label>
            <textarea className={input + " h-32 resize-none"} value={form.job_description}
              onChange={e => set("job_description", e.target.value)}
              placeholder="Paste the job description you're targeting..." />
          </div>
          <div>
            <label className={label}>Resume Tone</label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map(t => (
                <button key={t}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${form.tone === t ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:border-indigo-400"}`}
                  onClick={() => set("tone", t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 1
          ? <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setStep(s => s - 1)}>← Back</button>
          : <div />
        }
        {step < 4
          ? <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
              onClick={() => setStep(s => s + 1)}>Next →</button>
          : <button
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
              onClick={() => onSubmit(form)}>
              {loading ? "Generating..." : "Generate Resume ✨"}
            </button>
        }
      </div>
    </div>
  );
}