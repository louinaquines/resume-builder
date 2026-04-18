import { useState, useEffect, useRef } from "react";

const TONES = ["Professional", "Modern", "Creative", "Executive"];
const CIVIL_STATUS = ["Single", "Married", "Widowed", "Separated"];
const JOB_TYPES = ["Full-time", "Part-time", "Contractual", "Seasonal", "Remote"];
const PROFICIENCY = ["Basic", "Conversational", "Fluent", "Native"];
const emptyJob = () => ({ company: "", role: "", duration: "", responsibilities: "" });
const emptyEdu = () => ({ school: "", degree: "", year: "" });
const emptyCert = () => ({ name: "", issuer: "", year: "" });
const emptyLang = () => ({ language: "", proficiency: "Conversational" });
const emptyRef = () => ({ name: "", position: "", company: "", contact: "" });
const emptySeminar = () => ({ title: "", organizer: "", year: "" });

export default function StepForm({ onSubmit, onChange, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1
    full_name: "", email: "", phone: "", linkedin: "", social_link: "",
    headline: "", date_of_birth: "", civil_status: "", nationality: "Filipino",
    street: "", postal: "", province: "", municipality: "", barangay: "",
    photo: null,
    // Step 2
    work_experience: [emptyJob()],
    // Step 3
    education: [emptyEdu()],
    certifications: [emptyCert()],
    languages: [emptyLang()],
    skills: "",
    // Step 4
    job_title: "", job_description: "", tone: "Professional",
    job_type: "Full-time", availability: "",
    // Step 5
    references: [emptyRef()],
    seminars: [emptySeminar()],
  });

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/provinces/?limit=200")
      .then(r => r.json())
      .then(d => setProvinces(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  }, []);

  const handleProvinceChange = (code) => {
    set("province", code); set("municipality", ""); set("barangay", "");
    setMunicipalities([]); setBarangays([]);
    if (!code) return;
    fetch(`https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/?limit=200`)
      .then(r => r.json())
      .then(d => setMunicipalities(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  };

  const handleMunicipalityChange = (code) => {
    set("municipality", code); set("barangay", "");
    setBarangays([]);
    if (!code) return;
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/?limit=500`)
      .then(r => r.json())
      .then(d => setBarangays(d.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoPreview(ev.target.result); set("photo", ev.target.result); };
    reader.readAsDataURL(file);
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const setList = (field, i, key, value) => {
    const updated = [...form[field]];
    updated[i] = { ...updated[i], [key]: value };
    set(field, updated);
  };

  const addItem = (field, empty) => set(field, [...form[field], empty()]);
  const removeItem = (field, i) => set(field, form[field].filter((_, j) => j !== i));

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";
  const sec = "space-y-4";
  const card = "border border-gray-200 rounded-xl p-4 space-y-3";

  const provinceName = provinces.find(p => p.code === form.province)?.name || "";
  const municipalityName = municipalities.find(m => m.code === form.municipality)?.name || "";
  const barangayName = barangays.find(b => b.code === form.barangay)?.name || "";

  const buildLocation = () =>
    [form.street, barangayName, municipalityName, provinceName, form.postal].filter(Boolean).join(", ");

  const handleSubmit = () => onSubmit({ ...form, location: buildLocation() });

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({ ...form, location: buildLocation() });
    }
  }, [form, provinceName, municipalityName, barangayName]);

  const TOTAL_STEPS = 5;

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${step >= n ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>{n}</div>
            {n < TOTAL_STEPS && <div className={`flex-1 h-1 rounded ${step > n ? "bg-indigo-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── Personal Info */}
      {step === 1 && (
        <div className={sec}>
          <h2 className="font-semibold text-gray-800 text-lg">Personal Info</h2>

          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition"
              onClick={() => fileRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                    <circle cx="40" cy="40" r="40" fill="#e5e7eb"/>
                    <circle cx="40" cy="32" r="13" fill="#9ca3af"/>
                    <ellipse cx="40" cy="68" rx="22" ry="14" fill="#9ca3af"/>
                  </svg>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile Photo</p>
              <p className="text-xs text-gray-400 mb-1">Optional</p>
              <button className="text-xs text-indigo-600 hover:underline" onClick={() => fileRef.current.click()}>Upload photo</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </div>

          {[["Full Name", "full_name"], ["Professional Headline", "headline"], ["Email", "email"], ["Phone", "phone"]].map(([label, field]) => (
            <div key={field}>
              <label className={lbl}>{label}{field === "headline" && <span className="text-gray-400 text-xs ml-1">e.g. Registered Nurse, Accountant</span>}</label>
              <input className={inp} value={form[field]} onChange={e => set(field, e.target.value)} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Date of Birth</label>
              <input type="date" className={inp} value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Civil Status</label>
              <select className={inp} value={form.civil_status} onChange={e => set("civil_status", e.target.value)}>
                <option value="">Select...</option>
                {CIVIL_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={lbl}>Nationality</label>
            <input className={inp} value={form.nationality} onChange={e => set("nationality", e.target.value)} />
          </div>

          <div>
            <label className={lbl}>LinkedIn URL</label>
            <input className={inp} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/yourname" />
          </div>

          <div>
            <label className={lbl}>Other Social / Portfolio Link <span className="text-gray-400 text-xs ml-1">optional</span></label>
            <input className={inp} value={form.social_link} onChange={e => set("social_link", e.target.value)} placeholder="facebook.com/yourname or yourportfolio.com" />
          </div>

          {/* PH Location */}
          <div>
            <label className={lbl}>Province</label>
            <select className={inp} value={form.province} onChange={e => handleProvinceChange(e.target.value)}>
              <option value="">Select province...</option>
              {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>City / Municipality</label>
            <select className={inp} value={form.municipality} onChange={e => handleMunicipalityChange(e.target.value)} disabled={!form.province}>
              <option value="">Select city/municipality...</option>
              {municipalities.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Barangay</label>
            <select className={inp} value={form.barangay} onChange={e => set("barangay", e.target.value)} disabled={!form.municipality}>
              <option value="">Select barangay...</option>
              {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Street Address</label>
              <input className={inp} value={form.street} onChange={e => set("street", e.target.value)} placeholder="e.g. 123 Rizal St." />
            </div>
            <div>
              <label className={lbl}>Postal Code</label>
              <input className={inp} value={form.postal} onChange={e => set("postal", e.target.value)} placeholder="e.g. 6014" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── Work Experience */}
      {step === 2 && (
        <div className={sec}>
          <h2 className="font-semibold text-gray-800 text-lg">Work Experience</h2>
          {form.work_experience.map((job, i) => (
            <div key={i} className={card}>
              <p className="text-xs font-semibold text-indigo-500 uppercase">Job {i + 1}</p>
              {[["Company", "company"], ["Role / Title", "role"], ["Duration", "duration"]].map(([label, field]) => (
                <div key={field}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={job[field]} onChange={e => setList("work_experience", i, field, e.target.value)} />
                </div>
              ))}
              <div>
                <label className={lbl}>Responsibilities & Achievements</label>
                <textarea className={inp + " h-24 resize-none"} value={job.responsibilities}
                  onChange={e => setList("work_experience", i, "responsibilities", e.target.value)} />
              </div>
              {form.work_experience.length > 1 &&
                <button className="text-xs text-red-400 hover:text-red-600" onClick={() => removeItem("work_experience", i)}>Remove</button>}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("work_experience", emptyJob)}>+ Add another job</button>
        </div>
      )}

      {/* ── STEP 3 ── Education, Certifications, Languages, Skills */}
      {step === 3 && (
        <div className={sec}>
          <h2 className="font-semibold text-gray-800 text-lg">Education & Skills</h2>

          {/* Education */}
          {form.education.map((edu, i) => (
            <div key={i} className={card}>
              <p className="text-xs font-semibold text-indigo-500 uppercase">Education {i + 1}</p>
              {[["School / University", "school"], ["Degree / Course", "degree"], ["Year Graduated", "year"]].map(([label, field]) => (
                <div key={field}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={edu[field]} onChange={e => setList("education", i, field, e.target.value)} />
                </div>
              ))}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("education", emptyEdu)}>+ Add education</button>

          {/* Certifications */}
          <p className="font-medium text-gray-700 pt-2">Certifications & Licenses <span className="text-gray-400 text-xs">(PRC, TESDA, Driver's License, etc.)</span></p>
          {form.certifications.map((cert, i) => (
            <div key={i} className={card}>
              <p className="text-xs font-semibold text-indigo-500 uppercase">Cert {i + 1}</p>
              {[["Certificate / License Name", "name"], ["Issuing Organization", "issuer"], ["Year", "year"]].map(([label, field]) => (
                <div key={field}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={cert[field]} onChange={e => setList("certifications", i, field, e.target.value)} />
                </div>
              ))}
              {form.certifications.length > 1 &&
                <button className="text-xs text-red-400 hover:text-red-600" onClick={() => removeItem("certifications", i)}>Remove</button>}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("certifications", emptyCert)}>+ Add certification</button>

          {/* Languages */}
          <p className="font-medium text-gray-700 pt-2">Languages Spoken</p>
          {form.languages.map((lang, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className={lbl}>Language</label>
                <input className={inp} value={lang.language} onChange={e => setList("languages", i, "language", e.target.value)} placeholder="e.g. Filipino, English, Cebuano" />
              </div>
              <div className="w-36">
                <label className={lbl}>Proficiency</label>
                <select className={inp} value={lang.proficiency} onChange={e => setList("languages", i, "proficiency", e.target.value)}>
                  {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              {form.languages.length > 1 &&
                <button className="text-xs text-red-400 pb-2 hover:text-red-600" onClick={() => removeItem("languages", i)}>✕</button>}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("languages", emptyLang)}>+ Add language</button>

          {/* Skills */}
          <div>
            <label className={lbl}>Skills <span className="text-gray-400 text-xs">(comma separated)</span></label>
            <textarea className={inp + " h-20 resize-none"} value={form.skills}
              onChange={e => set("skills", e.target.value)}
              placeholder="e.g. Patient care, Microsoft Excel, Customer service, Cooking" />
          </div>
        </div>
      )}

      {/* ── STEP 4 ── Target Role & Preferences */}
      {step === 4 && (
        <div className={sec}>
          <h2 className="font-semibold text-gray-800 text-lg">Target Role & Preferences</h2>
          <div>
            <label className={lbl}>Target Job Title</label>
            <input className={inp} value={form.job_title} onChange={e => set("job_title", e.target.value)} placeholder="e.g. Senior Nurse, Accounting Staff" />
          </div>
          <div>
            <label className={lbl}>Job Description <span className="text-gray-400 text-xs">(paste or summarize)</span></label>
            <textarea className={inp + " h-28 resize-none"} value={form.job_description}
              onChange={e => set("job_description", e.target.value)}
              placeholder="Paste the job description you're targeting..." />
          </div>
          <div>
            <label className={lbl}>Job Type</label>
            <div className="flex gap-2 flex-wrap">
              {JOB_TYPES.map(t => (
                <button key={t}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${form.job_type === t ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:border-indigo-400"}`}
                  onClick={() => set("job_type", t)}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={lbl}>Availability / Start Date</label>
            <input className={inp} value={form.availability} onChange={e => set("availability", e.target.value)}
              placeholder="e.g. Immediately available, May 2025" />
          </div>
          <div>
            <label className={lbl}>Resume Tone</label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map(t => (
                <button key={t}
                  className={`px-3 py-1.5 rounded-full text-sm border transition
                    ${form.tone === t ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:border-indigo-400"}`}
                  onClick={() => set("tone", t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5 ── References & Seminars */}
      {step === 5 && (
        <div className={sec}>
          <h2 className="font-semibold text-gray-800 text-lg">References & Trainings</h2>

          {/* Character References */}
          <p className="font-medium text-gray-700">Character References</p>
          {form.references.map((ref, i) => (
            <div key={i} className={card}>
              <p className="text-xs font-semibold text-indigo-500 uppercase">Reference {i + 1}</p>
              {[["Full Name", "name"], ["Position / Title", "position"], ["Company / Organization", "company"], ["Contact Number", "contact"]].map(([label, field]) => (
                <div key={field}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={ref[field]} onChange={e => setList("references", i, field, e.target.value)} />
                </div>
              ))}
              {form.references.length > 1 &&
                <button className="text-xs text-red-400 hover:text-red-600" onClick={() => removeItem("references", i)}>Remove</button>}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("references", emptyRef)}>+ Add reference</button>

          {/* Seminars */}
          <p className="font-medium text-gray-700 pt-2">Seminars & Trainings Attended</p>
          {form.seminars.map((sem, i) => (
            <div key={i} className={card}>
              <p className="text-xs font-semibold text-indigo-500 uppercase">Seminar {i + 1}</p>
              {[["Title / Topic", "title"], ["Organizer", "organizer"], ["Year", "year"]].map(([label, field]) => (
                <div key={field}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={sem[field]} onChange={e => setList("seminars", i, field, e.target.value)} />
                </div>
              ))}
              {form.seminars.length > 1 &&
                <button className="text-xs text-red-400 hover:text-red-600" onClick={() => removeItem("seminars", i)}>Remove</button>}
            </div>
          ))}
          <button className="text-sm text-indigo-600 hover:underline" onClick={() => addItem("seminars", emptySeminar)}>+ Add seminar</button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 1
          ? <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setStep(s => s - 1)}>← Back</button>
          : <div />}
        {step < TOTAL_STEPS
          ? <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
              onClick={() => setStep(s => s + 1)}>Next →</button>
          : <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading} onClick={handleSubmit}>
              {loading ? "Generating..." : "Generate Resume ✨"}
            </button>}
      </div>
    </div>
  );
}