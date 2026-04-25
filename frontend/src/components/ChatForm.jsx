import { useState } from "react";

const STEPS = [
  {
    id: "full_name",
    question: "What's your full name?",
    subtitle: "This will appear at the top of your resume.",
    type: "text",
    placeholder: "e.g. Juan dela Cruz",
  },
  {
    id: "headline",
    question: "What's your professional title?",
    subtitle: "Your current or target job title.",
    type: "text",
    placeholder: "e.g. Registered Nurse, Accountant, Fresh Graduate",
  },
  {
    id: "email",
    question: "What's your email address?",
    type: "text",
    placeholder: "e.g. juan@email.com",
  },
  {
    id: "phone",
    question: "What's your phone number?",
    type: "text",
    placeholder: "e.g. 09XX XXX XXXX",
  },
  {
    id: "location",
    question: "Where are you located?",
    subtitle: "City, province, or full address — whatever you're comfortable sharing.",
    type: "text",
    placeholder: "Municipality, Province",
  },
  {
    id: "linkedin",
    question: "Do you have a LinkedIn profile?",
    subtitle: "Optional — skip if you don't have one.",
    type: "text",
    placeholder: "linkedin.com/in/yourname (or skip)",
    optional: true,
  },
  {
    id: "date_of_birth",
    question: "What is your date of birth?",
    subtitle: "Standard in Philippine resumes.",
    type: "text",
    placeholder: "e.g. January 1, 2000",
  },
  {
    id: "photo",
    question: "Would you like to add a photo?",
    subtitle: "Optional. It's common in some regions to include a professional headshot.",
    type: "file",
    accept: "image/*",
    optional: true,
  },
  {
    id: "civil_status",
    question: "What is your civil status?",
    type: "choice",
    options: [
      { value: "Single", label: "Single" },
      { value: "Married", label: "Married" },
      { value: "Widowed", label: "Widowed" },
      { value: "Separated", label: "Separated" },
    ],
  },
  {
    id: "gender",
    question: "What is your gender?",
    subtitle: "Optional field.",
    type: "choice",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Non-binary", label: "Non-binary" },
      { value: "Prefer not to say", label: "Prefer not to say" },
    ],
    optional: true,
  },
  {
    id: "nationality",
    question: "What is your nationality?",
    type: "text",
    placeholder: "e.g. Filipino",
  },
  {
    id: "job_title",
    question: "What job are you applying for?",
    subtitle: "Your target position.",
    type: "text",
    placeholder: "e.g. Senior Frontend Developer",
  },
  {
    id: "job_type",
    question: "What type of employment are you looking for?",
    type: "choice",
    options: [
      { value: "Full-time", label: "Full-time" },
      { value: "Part-time", label: "Part-time" },
      { value: "Contractual", label: "Contractual" },
      { value: "Seasonal", label: "Seasonal" },
      { value: "Remote", label: "Remote" },
    ],
  },
  {
    id: "availability",
    question: "When can you start?",
    type: "text",
    placeholder: "e.g. Immediately, May 2025",
  },
  {
    id: "skills",
    question: "What are your key skills?",
    subtitle: "List anything you're good at — technical or soft skills.",
    type: "textarea",
    placeholder: "e.g. Microsoft Excel, Customer service, Coding, Cooking, Writing, Editing",
  },
  {
    id: "work_experience_raw",
    question: "Describe your work experience.",
    subtitle: "Include company, role, duration, and what you did. Add multiple jobs separated by a blank line.",
    type: "textarea",
    placeholder: `Company name
Your position:
Duration: April 2022 - April 2023
Your responsibilities: `,
    optional: true,
  },
  {
    id: "education_raw",
    question: "What is your educational background?",
    type: "textarea",
    placeholder: `Name of School
What Degree or Course you took:
What year you graduated:`,
  },
  {
    id: "certifications_raw",
    question: "Do you have any certifications or licenses?",
    subtitle: "PRC license, TESDA, Driver's License, etc. Skip if none.",
    type: "textarea",
    placeholder: `Name: National Id 
Issuer: PhilSys
Year: 2023`,
    optional: true,
  },
  {
    id: "languages_raw",
    question: "What languages do you speak?",
    type: "textarea",
    placeholder: `Filipino - Fluent
English - Conversational
Cebuano - Native`,
    optional: true,
  },
  {
    id: "seminars_raw",
    question: "Have you attended any seminars or trainings?",
    subtitle: "Optional — skip if none.",
    type: "textarea",
    placeholder: `Title: Web Development Bootcamp
Organizer: Zuitt
Year: 2022`,
    optional: true,
  },
  {
    id: "references_raw",
    question: "Who are your character references?",
    subtitle: "Name, position, company, and contact. Optional.",
    type: "textarea",
    placeholder: `Name: Maria Santos
Position: 
Company: 
Contact: 09XX XXX XXXX`,
    optional: true,
  },
  {
    id: "_submit",
    question: "You're all set! Ready to generate your resume?",
    subtitle: "AI will write your professional resume based on your answers.",
    type: "submit",
  },

];

function parseWorkExperience(raw) {
  if (!raw?.trim()) return [];
  const blocks = raw.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.replace(/^[^:]+:\s*/i, "").trim() : "";
    };
    // If no labels found, treat whole block as responsibilities
    const company = get("company") || get("employer") || get("organization");
    const role = get("role") || get("title") || get("position") || get("job");
    const duration = get("duration") || get("period") || get("date") || get("year");
    const responsibilities = get("responsibilities") || get("duties") || get("description") || get("achievements")
      || lines.filter(l => !l.match(/^(company|role|title|duration|period|date|position|job|employer):/i)).join(" ");
    return { company, role, duration, responsibilities };
  }).filter(j => j.company || j.role || j.responsibilities);
}

function parseEducation(raw) {
  if (!raw?.trim()) return [];
  return raw.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.replace(/^[^:]+:\s*/i, "").trim() : "";
    };
    const school = get("school") || get("university") || get("college") || get("institution");
    const degree = get("degree") || get("course") || get("program");
    const year = get("year") || get("graduated") || get("graduation");
    return { school, degree, year };
  }).filter(e => e.school || e.degree);
}

function parseCertifications(raw) {
  if (!raw?.trim()) return [];
  return raw.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.replace(/^[^:]+:\s*/i, "").trim() : "";
    };
    const name = get("name") || get("certificate") || get("certification") || get("license") || lines[0] || "";
    const issuer = get("issuer") || get("issued by") || get("organization") || get("org");
    const year = get("year") || get("date");
    return { name, issuer, year };
  }).filter(c => c.name);
}

function parseLanguages(raw) {
  if (!raw?.trim()) return [];
  return raw.trim().split("\n").map(line => {
    line = line.trim();
    if (!line) return null;
    // Handle "Filipino - Fluent" or "Filipino: Fluent" or just "Filipino"
    const parts = line.split(/[-:]/);
    return {
      language: parts[0]?.trim() || "",
      proficiency: parts[1]?.trim() || "Fluent",
    };
  }).filter(Boolean).filter(l => l.language);
}

function parseSeminars(raw) {
  if (!raw?.trim()) return [];
  return raw.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.replace(/^[^:]+:\s*/i, "").trim() : "";
    };
    const title = get("title") || get("seminar") || get("training") || get("topic") || lines[0] || "";
    const organizer = get("organizer") || get("organization") || get("org") || get("hosted by");
    const year = get("year") || get("date");
    return { title, organizer, year };
  }).filter(s => s.title);
}

function parseReferences(raw) {
  if (!raw?.trim()) return [];
  return raw.trim().split(/\n\s*\n/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.replace(/^[^:]+:\s*/i, "").trim() : "";
    };
    const name = get("name") || lines[0] || "";
    const position = get("position") || get("title") || get("role");
    const company = get("company") || get("organization") || get("employer");
    const contact = get("contact") || get("phone") || get("number") || get("email");
    return { name, position, company, contact };
  }).filter(r => r.name);
}
export default function ChatForm({ onResumeReady, loading }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState("");
  const [animating, setAnimating] = useState(false);

  const step = STEPS[currentStep];
  const progress = currentStep >= 0 ? Math.round(((currentStep + 1) / STEPS.length) * 100) : 0;

  const goNext = (value) => {
    if (animating) return;
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    setTextInput("");
    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      if (currentStep + 1 >= STEPS.length) {
        // Build final data object
        const data = {
          full_name: newAnswers.full_name || "",
          headline: newAnswers.headline || "",
          tone: "Professional",
          email: newAnswers.email || "",
          phone: newAnswers.phone || "",
          location: newAnswers.location || "",
          linkedin: newAnswers.linkedin || "",
          social_link: "",
          photo: "",
          date_of_birth: newAnswers.date_of_birth || "",
          civil_status: newAnswers.civil_status || "",
          nationality: newAnswers.nationality || "",
          gender: newAnswers.gender !== "Prefer not to say" ? newAnswers.gender || "" : "",
          job_title: newAnswers.job_title || "",
          job_description: "",
          job_type: newAnswers.job_type || "Full-time",
          availability: newAnswers.availability || "",
          skills: newAnswers.skills || "",
          work_experience: parseWorkExperience(newAnswers.work_experience_raw),
          education: parseEducation(newAnswers.education_raw),
          certifications: parseCertifications(newAnswers.certifications_raw),
          languages: parseLanguages(newAnswers.languages_raw),
          seminars: parseSeminars(newAnswers.seminars_raw),
          references: parseReferences(newAnswers.references_raw),
          color_accent: "Classic Black",
          photo: newAnswers.photo || "",
          template: "Minimalist",
          goal: "Applying for a Job",
          bullet_style: "Short & Punchy",
        };
        onResumeReady(data);
      } else {
        setCurrentStep(s => s + 1);
      }
    }, 300);
  };

  const handleTextNext = () => {
    const val = textInput.trim();
    if (!val && !step?.optional) return;
    goNext(val || "");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && step?.type === "text") {
      e.preventDefault();
      handleTextNext();
    }
  };

  // Start screen
  if (currentStep === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 p-8">
        <div className="text-center space-y-4">
          <div className="text-5xl">✨</div>
          <h2 className="text-2xl font-bold text-white">Let's build your resume</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            We'll ask you a few quick questions. No complicated forms — just pick or type your answers and we'll handle the rest.
          </p>
        </div>
        <button
          onClick={() => setCurrentStep(0)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:-translate-y-1">
          Get Started →
        </button>
      </div>
    );
  }

  // Generating screen
  if (currentStep >= STEPS.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 p-8">
        {loading ? (
          <>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-semibold text-lg">Building your resume...</p>
            <p className="text-slate-400 text-sm">AI is writing your content, hang tight ✨</p>
          </>
        ) : (
          <>
            <div className="text-5xl">🎉</div>
            <p className="text-white font-semibold text-lg">Your resume is ready!</p>
            <p className="text-slate-400 text-sm">Check the preview on the right and download your PDF.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[580px] p-6 gap-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Question {currentStep + 1} of {STEPS.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{step.question}</h2>
          {step.subtitle && <p className="text-slate-400 text-sm">{step.subtitle}</p>}
        </div>

        {/* Choice type */}
        {step.type === "choice" && (
          <div className="grid grid-cols-1 gap-3">
            {step.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => goNext(opt.value)}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-400/50 text-left transition-all duration-200 group">
                {opt.color && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/20"
                    style={{ backgroundColor: opt.color }} />
                )}
                <div>
                  <p className="text-white font-medium group-hover:text-indigo-200">{opt.label}</p>
                  {opt.desc && <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Text type */}
        {step.type === "text" && (
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={step.placeholder}
              className="w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              {step.optional && (
                <button onClick={() => goNext("")}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                  Skip
                </button>
              )}
              <button
                onClick={handleTextNext}
                disabled={!textInput.trim() && !step.optional}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-3 rounded-xl font-medium text-sm transition-all">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Textarea type */}
        {step.type === "textarea" && (
          <div className="space-y-3">
            <textarea
              autoFocus
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={step.placeholder}
              rows={6}
              className="w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
            />
            <div className="flex gap-2">
              {step.optional && (
                <button onClick={() => goNext("")}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                  Skip
                </button>
              )}
              <button
                onClick={handleTextNext}
                disabled={!textInput.trim() && !step.optional}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-3 rounded-xl font-medium text-sm transition-all">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* File type */}
        {step.type === "file" && (
          <div className="space-y-3">
            <div className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-8 text-center border-dashed">
              <input
                type="file"
                accept={step.accept}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setTextInput(reader.result);
                  };
                  reader.readAsDataURL(file);
                }}
                className="text-white text-sm w-full"
              />
              {textInput && textInput.startsWith("data:image") && (
                <div className="mt-4 flex justify-center">
                  <img src={textInput} alt="Preview" className="w-24 h-24 object-cover rounded-full border-2 border-indigo-500" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {step.optional && (
                <button onClick={() => goNext("")}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all">
                  Skip
                </button>
              )}
              <button
                onClick={() => goNext(textInput)}
                disabled={!textInput && !step.optional}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-3 rounded-xl font-medium text-sm transition-all">
                Continue →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit type */}
      {step.type === "submit" && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-slate-300 text-sm">✅ <strong className="text-white">{answers.full_name}</strong></p>
            <p className="text-slate-300 text-sm">✅ <strong className="text-white">{answers.headline}</strong></p>
            <p className="text-slate-300 text-sm">✅ {answers.email} · {answers.phone}</p>
            <p className="text-slate-300 text-sm">✅ {answers.location}</p>
            {answers.work_experience_raw && <p className="text-slate-300 text-sm">✅ Work experience added</p>}
            {answers.education_raw && <p className="text-slate-300 text-sm">✅ Education added</p>}
            {answers.skills && <p className="text-slate-300 text-sm">✅ Skills: {answers.skills.slice(0, 40)}{answers.skills.length > 40 ? "..." : ""}</p>}
          </div>
          <button
            onClick={() => goNext("confirmed")}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300">
            ✨ Generate My Resume
          </button>
        </div>
      )}

      {/* Back button */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(s => s - 1)}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors self-start">
          ← Back
        </button>
      )}
    </div>
  );
}