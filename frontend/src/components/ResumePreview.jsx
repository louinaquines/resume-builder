export default function ResumePreview({ data, markdown, loading, scale = 0.6 }) {
  if (!markdown && !loading && !data) return null;

  if (loading && !markdown) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 flex items-center gap-2 text-gray-400 text-sm"
        style={{ width: "490px" }}>
        <span className="animate-pulse">✦</span> Generating your resume...
      </div>
    );
  }

  // ── PARSE MARKDOWN ────────────────────────────────────────
  const lines = (markdown || "").split("\n").map(l => l.trim()).filter(Boolean);
  let name = "", contact = "", summary = [];
  let experience = [], education = [], skills = [], certifications = [];
  let languages = [], seminarsAttended = [], characterRefs = [], personalInfo = "";
  let currentSection = null, currentJob = null, currentEdu = null;

  for (const line of lines) {
    if (line.startsWith("# ")) { name = line.slice(2).trim(); continue; }

    if (!currentSection && name && !contact &&
      (line.includes("@") || (line.split("|").length >= 2 && (line.includes(".") || line.includes("09"))))) {
      contact = line; continue;
    }

    if (line.startsWith("## ")) {
      if (currentJob) { experience.push(currentJob); currentJob = null; }
      if (currentEdu) { education.push(currentEdu); currentEdu = null; }
      const sec = line.slice(3).toLowerCase();
      if (sec.includes("summary") || sec.includes("objective")) { currentSection = "summary"; continue; }
      if (sec.includes("experience")) { currentSection = "experience"; continue; }
      if (sec.includes("education")) { currentSection = "education"; continue; }
      if (sec.includes("skill")) { currentSection = "skills"; continue; }
      if (sec.includes("personal")) { currentSection = "personalinfo"; continue; }
      if (sec.includes("certif") || sec.includes("license")) { currentSection = "certifications"; continue; }
      if (sec.includes("language")) { currentSection = "languages"; continue; }
      if (sec.includes("seminar") || sec.includes("training")) { currentSection = "seminars"; continue; }
      if (sec.includes("reference")) { currentSection = "references"; continue; }
      currentSection = null; continue;
    }

    if (line.startsWith("### ")) {
      const title = line.slice(4).trim();
      if (currentSection === "experience") { if (currentJob) experience.push(currentJob); currentJob = { title, bullets: [] }; }
      else if (currentSection === "education") { if (currentEdu) education.push(currentEdu); currentEdu = { title }; }
      continue;
    }

    if ((line.startsWith("- ") || line.startsWith("* ")) && currentSection === "experience" && currentJob) {
      currentJob.bullets.push(line.slice(2).trim()); continue;
    }

    if (currentSection === "summary") { summary.push(line); continue; }
    if (currentSection === "skills" && line) { skills.push(line); continue; }
    if (currentSection === "personalinfo" && line) { personalInfo += line + " "; continue; }
    if (currentSection === "certifications" && line) { certifications.push(line.replace(/^-\s*/, "")); continue; }
    if (currentSection === "languages" && line) { languages.push(line.replace(/^-\s*/, "")); continue; }
    if (currentSection === "seminars" && line) { seminarsAttended.push(line.replace(/^-\s*/, "")); continue; }
    if (currentSection === "references" && line) { characterRefs.push(line.replace(/^-\s*/, "")); continue; }
  }
  if (currentJob) experience.push(currentJob);
  if (currentEdu) education.push(currentEdu);

  // ── FALLBACKS FROM DATA ───────────────────────────────────
  const displayName = name || data?.full_name || "";
  const displayHeadline = data?.job_title || data?.headline || "";
  const summaryText = summary.join(" ") || "";
  const contactParts = contact
    ? contact.split("|").map(p => p.trim()).filter(Boolean)
    : [data?.email, data?.phone, data?.location, data?.linkedin].filter(Boolean);

  if (!personalInfo && data) {
    personalInfo = [
      data.date_of_birth ? `DOB: ${data.date_of_birth}` : "",
      data.gender ? `Gender: ${data.gender}` : "",
      data.civil_status ? `Civil Status: ${data.civil_status}` : "",
      data.nationality ? `Nationality: ${data.nationality}` : "",
      data.availability ? `Availability: ${data.availability}` : "",
      data.job_type ? `Job Type: ${data.job_type}` : "",
    ].filter(Boolean).join(" | ");
  }

  if (skills.length === 0 && data?.skills) {
    skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
  }

  if (education.length === 0 && Array.isArray(data?.education)) {
    education = data.education.filter(e => e.school || e.degree).map(e => ({
      title: `${e.degree || ""} — ${e.school || ""}${e.year ? ` | ${e.year}` : ""}`.trim(),
    }));
  }

  if (experience.length === 0 && Array.isArray(data?.work_experience)) {
    experience = data.work_experience.filter(j => j.company || j.role).map(j => ({
      title: `${j.role || ""} — ${j.company || ""}${j.duration ? ` | ${j.duration}` : ""}`.trim(),
      bullets: (j.responsibilities || "").split("\n").map(b => b.trim()).filter(Boolean),
    }));
  }

  if (certifications.length === 0 && Array.isArray(data?.certifications)) {
    certifications = data.certifications.filter(c => c.name).map(c =>
      `${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`);
  }

  if (languages.length === 0 && Array.isArray(data?.languages)) {
    languages = data.languages.filter(l => l.language).map(l =>
      `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`);
  }

  if (seminarsAttended.length === 0 && Array.isArray(data?.seminars)) {
    seminarsAttended = data.seminars.filter(s => s.title).map(s =>
      `${s.title}${s.organizer ? ` — ${s.organizer}` : ""}${s.year ? ` (${s.year})` : ""}`);
  }

  if (characterRefs.length === 0 && Array.isArray(data?.references)) {
    characterRefs = data.references.filter(r => r.name).map(r =>
      [r.name, r.position, r.company, r.contact].filter(Boolean).join(" | "));
  }

  const PAGE_W = 816, PAGE_H = 1056, SCALE = scale;

  // ── ICONS ─────────────────────────────────────────────────
  const Icon = ({ path }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
  const icons = {
    person: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
    phone: "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z",
    email: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    briefcase: "M20 6h-2.18c.07-.23.18-.46.18-.71C18 3.47 16.53 2 14.71 2H9.29C7.47 2 6 3.47 6 5.29c0 .25.11.48.18.71H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-.71c0 .39-.32.71-.71.71H9.71C9.32 6 9 5.68 9 5.29 9 4.58 9.58 4 10.29 4h3.43C14.42 4 15 4.58 15 5.29zM11 15H9v-2H7v-2h2V9h2v2h2v2h-2v2zm6-1h-4v-2h4v2zm0-4h-4V8h4v2z",
    graduation: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
    star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    award: "M12 1l3 6 6 .75-4.5 4.5L18 18l-6-3-6 3 1.5-5.75L3 7.75 9 7z",
    language: "M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z",
  };

  const SidebarSection = ({ title, icon, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{ color: "#4b5563" }}><Icon path={icons[icon] || icons.star} /></div>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#374151" }}>{title}</span>
      </div>
      <div style={{ width: "100%", height: 1, background: "#d1d5db", marginBottom: 8 }} />
      {children}
    </div>
  );

  const MainSection = ({ title, icon, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#1e293b",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0,
        }}>
          <Icon path={icons[icon] || icons.star} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#1e293b" }}>{title}</span>
      </div>
      <div style={{ width: "100%", height: 1.5, background: "#1e293b", marginBottom: 10 }} />
      {children}
    </div>
  );

  const sidebarTextStyle = { fontSize: 10, color: "#4b5563", marginBottom: 3, lineHeight: 1.5, wordBreak: "break-word" };
  const bulletStyle = { fontSize: 10, color: "#4b5563", marginBottom: 3, lineHeight: 1.5 };

  return (
    <div style={{ width: PAGE_W * SCALE, height: PAGE_H * SCALE, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div id="resume-print-target" style={{
        fontFamily: "Georgia, serif", width: PAGE_W, height: PAGE_H,
        transform: `scale(${SCALE})`, transformOrigin: "top left",
        position: "absolute", top: 0, left: 0, background: "white", overflow: "hidden",
      }}>
        {/* ── HEADER ── */}
        <div style={{ background: "#1e293b", padding: "24px 32px", display: "flex", alignItems: "center", gap: 24 }}>
          {/* Circle photo */}
          <div style={{
            width: 90, height: 90, borderRadius: "50%", overflow: "hidden",
            border: "3px solid white", flexShrink: 0, background: "#475569",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {data?.photo
              ? <img src={data.photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }} fill="none">
                <circle cx="40" cy="40" r="40" fill="#475569" />
                <circle cx="40" cy="30" r="15" fill="#94a3b8" />
                <ellipse cx="40" cy="68" rx="24" ry="16" fill="#94a3b8" />
              </svg>}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "white", margin: 0 }}>
              {displayName}
            </h1>
            <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4, margin: 0 }}>{displayHeadline}</p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", height: PAGE_H - 138 }}>
          {/* ── SIDEBAR ── */}
          <div style={{ width: 220, background: "#f3f4f6", padding: "20px 16px", flexShrink: 0, overflowY: "hidden" }}>

            <SidebarSection title="Contact" icon="phone">
              {contactParts.length > 0
                ? contactParts.map((p, i) => <p key={i} style={sidebarTextStyle}>{p}</p>)
                : <p style={{ ...sidebarTextStyle, color: "#9ca3af" }}>—</p>}
            </SidebarSection>

            <SidebarSection title="Personal Info" icon="person">
              {personalInfo
                ? personalInfo.split("|").map((p, i) => <p key={i} style={sidebarTextStyle}>{p.trim()}</p>)
                : <p style={{ ...sidebarTextStyle, color: "#9ca3af" }}>—</p>}
            </SidebarSection>

            <SidebarSection title="Key Skills" icon="star">
              {skills.length > 0
                ? skills.map((s, i) => <p key={i} style={sidebarTextStyle}
                  dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />)
                : <p style={{ ...sidebarTextStyle, color: "#9ca3af" }}>—</p>}
            </SidebarSection>

            <SidebarSection title="Certifications" icon="award">
              {certifications.length > 0
                ? certifications.map((c, i) => <p key={i} style={sidebarTextStyle}>• {c}</p>)
                : <p style={{ ...sidebarTextStyle, color: "#9ca3af" }}>—</p>}
            </SidebarSection>

            <SidebarSection title="Languages" icon="language">
              {languages.length > 0
                ? languages.map((l, i) => <p key={i} style={sidebarTextStyle}>• {l}</p>)
                : <p style={{ ...sidebarTextStyle, color: "#9ca3af" }}>—</p>}
            </SidebarSection>

          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, padding: "20px 24px", overflowY: "hidden" }}>

            <MainSection title="Career Objective" icon="person">
              {summaryText
                ? <p style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.7, textAlign: "justify" }}>{summaryText}</p>
                : <p style={{ fontSize: 10, color: "#9ca3af" }}>—</p>}
            </MainSection>

            <MainSection title="Work Experience" icon="briefcase">
              {experience.length > 0
                ? experience.map((job, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: "2px solid #e5e7eb" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>{job.title}</p>
                    {job.bullets.map((b, j) => (
                      <p key={j} style={bulletStyle}>• {b}</p>
                    ))}
                  </div>
                ))
                : <p style={{ fontSize: 10, color: "#9ca3af" }}>—</p>}
            </MainSection>

            <MainSection title="Education" icon="graduation">
              {education.length > 0
                ? education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: "2px solid #e5e7eb" }}>
                    <p style={{ fontSize: 11, color: "#1e293b" }}>{e.title}</p>
                  </div>
                ))
                : <p style={{ fontSize: 10, color: "#9ca3af" }}>—</p>}
            </MainSection>

            <MainSection title="Seminars & Trainings" icon="star">
              {seminarsAttended.length > 0
                ? seminarsAttended.map((s, i) => (
                  <div key={i} style={{ marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #e5e7eb" }}>
                    <p style={bulletStyle}>{s}</p>
                  </div>
                ))
                : <p style={{ fontSize: 10, color: "#9ca3af" }}>—</p>}
            </MainSection>

            <MainSection title="Character References" icon="person">
              {characterRefs.length > 0
                ? characterRefs.map((r, i) => (
                  <p key={i} style={bulletStyle}>• {r}</p>
                ))
                : <p style={{ fontSize: 10, color: "#9ca3af" }}>Available upon request.</p>}
            </MainSection>

          </div>
        </div>
      </div>
    </div>
  );
}