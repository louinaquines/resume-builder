export default function ResumePreview({ data, markdown, loading }) {
  if (!markdown && !loading) return null;

  if (loading && !markdown) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl flex items-center gap-2 text-gray-400 text-sm">
        <span className="animate-pulse">✦</span> Generating your resume...
      </div>
    );
  }

  const lines = markdown ? markdown.split("\n").map(l => l.trim()).filter(l => l !== "") : [];

  let name = "", contact = "", summary = [];
  let experience = [], education = [], skills = [];
  let certifications = [], languages = [], seminarsAttended = [], characterRefs = [], personalInfo = "";

  let currentSection = null, currentJob = null, currentEdu = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Name
    if (trimmed.startsWith("# ")) {
      name = trimmed.slice(2).trim();
      continue;
    }

    // Contact line
    if ((trimmed.includes("@") || trimmed.split("|").length >= 2) && !trimmed.startsWith("#")) {
      contact = trimmed;
      continue;
    }

    // Section headers
    if (trimmed.startsWith("## ")) {
      const sec = trimmed.slice(3).toLowerCase();

      if (sec.includes("summary")) { currentSection = "summary"; continue; }
      if (sec.includes("experience")) { currentSection = "experience"; continue; }
      if (sec.includes("education")) { currentSection = "education"; continue; }
      if (sec.includes("skill")) { currentSection = "skills"; continue; }

      // NEW SECTIONS
      if (trimmed === "## Personal Information") { currentSection = "personalinfo"; continue; }
      if (trimmed === "## Certifications & Licenses") { currentSection = "certifications"; continue; }
      if (trimmed === "## Languages") { currentSection = "languages"; continue; }
      if (trimmed === "## Seminars & Trainings") { currentSection = "seminars"; continue; }
      if (trimmed === "## Character References") { currentSection = "references"; continue; }

      currentSection = null;
      continue;
    }

    // Subsection (job or education entry)
    if (trimmed.startsWith("### ")) {
      const title = trimmed.slice(4).trim();
      if (currentSection === "experience") {
        if (currentJob) experience.push(currentJob);
        currentJob = { title, bullets: [] };
      } else if (currentSection === "education") {
        if (currentEdu) education.push(currentEdu);
        currentEdu = { title };
      }
      continue;
    }

    // Bullets
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bullet = trimmed.slice(2).trim();
      if (currentSection === "experience" && currentJob) {
        currentJob.bullets.push(bullet);
      }
      continue;
    }

    // Body text per section
    if (currentSection === "summary") { summary.push(trimmed); continue; }
    if (currentSection === "skills") { skills.push(trimmed); continue; }

    // NEW SECTION PARSING
    if (currentSection === "personalinfo") { personalInfo = trimmed; continue; }
    if (currentSection === "certifications" && trimmed) { certifications.push(trimmed); continue; }
    if (currentSection === "languages" && trimmed) { languages.push(trimmed); continue; }
    if (currentSection === "seminars" && trimmed) { seminarsAttended.push(trimmed); continue; }
    if (currentSection === "references" && trimmed) { characterRefs.push(trimmed); continue; }
  }

  // Flush last items
  if (currentJob) experience.push(currentJob);
  if (currentEdu) education.push(currentEdu);

  const fallbackSummary = [data?.headline, data?.job_description].filter(Boolean).join(" ");
  const summaryText = summary.join(" ") || fallbackSummary;

  const fallbackContactParts = [
    data?.email,
    data?.phone,
    data?.linkedin,
    data?.social_link,
    data?.location,
  ].filter(Boolean);
  const contactParts = (contact ? contact.split("|").map(p => p.trim()).filter(Boolean) : fallbackContactParts);

  if (skills.length === 0 && data?.skills) {
    skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  if (education.length === 0 && Array.isArray(data?.education)) {
    education = data.education
      .filter((e) => e?.school || e?.degree || e?.year)
      .map((e) => ({
        title: [e.degree, e.school].filter(Boolean).join(" - ") + (e.year ? ` (${e.year})` : ""),
      }));
  }

  if (experience.length === 0 && Array.isArray(data?.work_experience)) {
    experience = data.work_experience
      .filter((j) => j?.company || j?.role || j?.duration || j?.responsibilities)
      .map((j) => ({
        title: [j.role, j.company].filter(Boolean).join(" - ") + (j.duration ? ` (${j.duration})` : ""),
        bullets: (j.responsibilities || "")
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
      }));
  }

  if (certifications.length === 0 && Array.isArray(data?.certifications)) {
    certifications = data.certifications
      .filter((c) => c?.name || c?.issuer || c?.year)
      .map((c) => [c.name, c.issuer].filter(Boolean).join(" - ") + (c.year ? ` (${c.year})` : ""));
  }

  if (languages.length === 0 && Array.isArray(data?.languages)) {
    languages = data.languages
      .filter((l) => l?.language)
      .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`);
  }

  if (seminarsAttended.length === 0 && Array.isArray(data?.seminars)) {
    seminarsAttended = data.seminars
      .filter((s) => s?.title || s?.organizer || s?.year)
      .map((s) => [s.title, s.organizer].filter(Boolean).join(" - ") + (s.year ? ` (${s.year})` : ""));
  }

  if (characterRefs.length === 0 && Array.isArray(data?.references)) {
    characterRefs = data.references
      .filter((r) => r?.name || r?.position || r?.company || r?.contact)
      .map((r) => [r.name, r.position, r.company, r.contact].filter(Boolean).join(" - "));
  }

  if (!personalInfo) {
    const personalParts = [
      data?.date_of_birth ? `DOB: ${data.date_of_birth}` : "",
      data?.civil_status ? `Civil Status: ${data.civil_status}` : "",
      data?.nationality ? `Nationality: ${data.nationality}` : "",
      data?.availability ? `Availability: ${data.availability}` : "",
      data?.job_type ? `Preferred Job Type: ${data.job_type}` : "",
    ].filter(Boolean);
    personalInfo = personalParts.join(" | ");
  }

  const PAGE_WIDTH_PX = 816;
  const PAGE_HEIGHT_PX = 1056;
  const SCALE = 0.6;

  const renderSkillLine = (line) => (
    <p className="text-xs text-slate-700"
      dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
  );

  return (
    <div style={{ width: `${PAGE_WIDTH_PX * SCALE}px`, height: `${PAGE_HEIGHT_PX * SCALE}px`, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <div className="bg-white shadow overflow-hidden" style={{
            fontFamily: "Georgia, serif",
            width: `${PAGE_WIDTH_PX}px`,
            height: `${PAGE_HEIGHT_PX}px`,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
        }}>
            {/* Header */}
            <div className="bg-slate-800 text-white px-8 py-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-slate-600">
                {data?.photo
                    ? <img src={data.photo} alt="profile" className="w-full h-full object-cover" />
                    : (
                    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                        <circle cx="40" cy="40" r="40" fill="#475569"/>
                        <circle cx="40" cy="32" r="13" fill="#94a3b8"/>
                        <ellipse cx="40" cy="68" rx="22" ry="14" fill="#94a3b8"/>
                    </svg>
                    )}
                </div>
                <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">{name || data?.full_name}</h1>
                <p className="text-slate-300 text-sm mt-1">{data?.job_title || data?.headline}</p>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-52 bg-slate-100 p-5 space-y-6 flex-shrink-0">
                {/* Contact */}
                {contactParts.length > 0 && (
                    <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Contact</h3>
                    <div className="space-y-1">
                        {contactParts.map((part, i) => (
                        <p key={i} className="text-xs text-slate-600 break-all">{part}</p>
                        ))}
                    </div>
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Skills</h3>
                    <div className="space-y-1">
                        {skills.map((s, i) => <div key={i}>{renderSkillLine(s)}</div>)}
                    </div>
                    </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Education</h3>
                    <div className="space-y-2">
                        {education.map((e, i) => (
                        <p key={i} className="text-xs text-slate-700">{e.title}</p>
                        ))}
                    </div>
                    </div>
                )}
                {certifications.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Certifications</h3>
                        <div className="space-y-1">
                        {certifications.map((c, i) => <p key={i} className="text-xs text-slate-700">{c.replace(/^-\s*/, "")}</p>)}
                        </div>
                    </div>
                )}

                {languages.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Languages</h3>
                        <div className="space-y-1">
                        {languages.map((l, i) => <p key={i} className="text-xs text-slate-700">{l.replace(/^-\s*/, "")}</p>)}
                        </div>
                    </div>
                )}

                {personalInfo && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-300 pb-1 mb-2">Personal Info</h3>
                        <p className="text-xs text-slate-700"
                        dangerouslySetInnerHTML={{ __html: personalInfo.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                    </div>
                )}
                </div>

                {/* Main */}
                <div className="flex-1 p-6 space-y-5">
                {/* Summary */}
                {summaryText && (
                    <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                        Professional Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed">{summaryText}</p>
                    </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                        Work Experience
                    </h2>
                    <div className="space-y-4">
                        {experience.map((job, i) => (
                        <div key={i}>
                            <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                            <ul className="mt-1 space-y-1">
                            {job.bullets.map((b, j) => (
                                <li key={j} className="text-xs text-slate-600 flex gap-2">
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span>{b}</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                {seminarsAttended.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                        Seminars & Trainings
                        </h2>
                        <ul className="space-y-1">
                        {seminarsAttended.map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="text-slate-400">•</span>
                            <span>{s.replace(/^-\s*/, "")}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                {characterRefs.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                        Character References
                        </h2>
                        <ul className="space-y-1">
                        {characterRefs.map((r, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="text-slate-400">•</span>
                            <span>{r.replace(/^-\s*/, "")}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
                </div>
            </div>
        </div>
    </div>
  );
}
