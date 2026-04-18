export default function PDFExport({ markdown, data }) {
  const handlePrint = () => {
    const el = document.getElementById("resume-live");
    if (!el) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; width: 816px; }
  @page { size: letter; margin: 0; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

  .resume-header { background-color: #1e293b !important; color: white; padding: 24px 32px; display: flex; align-items: center; gap: 24px; }
  .resume-photo { width: 80px; height: 80px; border-radius: 50%; border: 2px solid white; overflow: hidden; flex-shrink: 0; background: #475569; }
  .resume-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .resume-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: white; }
  .resume-role { color: #cbd5e1; font-size: 13px; margin-top: 4px; }
  .resume-body { display: flex; min-height: 936px; }
  .resume-sidebar { width: 208px; background-color: #f1f5f9 !important; padding: 20px; flex-shrink: 0; }
  .resume-main { flex: 1; padding: 24px; }
  .sidebar-section { margin-bottom: 20px; }
  .sidebar-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #64748b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; }
  .sidebar-text { font-size: 10px; color: #475569; margin-bottom: 3px; word-break: break-all; }
  .main-section { margin-bottom: 20px; }
  .main-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 4px; margin-bottom: 10px; }
  .job-title { font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 4px; margin-top: 10px; }
  .job-title:first-child { margin-top: 0; }
  .bullet { display: flex; gap: 6px; font-size: 10px; color: #475569; margin-bottom: 3px; }
  .bullet-dot { color: #94a3b8; flex-shrink: 0; }
  .summary-text { font-size: 10px; color: #475569; line-height: 1.6; }
  .skill-line { font-size: 10px; color: #374151; margin-bottom: 2px; }
  .skill-line strong { font-weight: bold; }
</style>
</head>
<body>
${buildPrintHTML(data, el)}
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
  };

  if (!markdown) return null;

  return (
    <div style={{ width: "490px" }}>
      <button onClick={handlePrint}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
        ⬇ Download as PDF
      </button>
    </div>
  );
}

function buildPrintHTML(data, el) {
  if (!el || !data) return "";

  // Extract all text from the live rendered element by section
  const getName = () => el.querySelector("h1")?.innerText || data.full_name || "";
  const getRole = () => el.querySelector("h1 + p, h1 ~ p")?.innerText || data.job_title || data.headline || "";

  // Get sidebar sections
  const sidebarEl = el.querySelector(".resume-sidebar-inner") || el.querySelectorAll("div > div")[1]?.querySelector("div");

  // Build from data directly — most reliable
  const photoHTML = data.photo
    ? `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : `<svg viewBox="0 0 80 80" style="width:100%;height:100%;" fill="none">
        <circle cx="40" cy="40" r="40" fill="#475569"/>
        <circle cx="40" cy="32" r="13" fill="#94a3b8"/>
        <ellipse cx="40" cy="68" rx="22" ry="14" fill="#94a3b8"/>
       </svg>`;

  const contactItems = [data.email, data.phone, data.linkedin, data.social_link, data.location]
    .filter(Boolean)
    .map(c => `<p class="sidebar-text">${c}</p>`).join("");

  const personalItems = [
    data.date_of_birth ? `DOB: ${data.date_of_birth}` : "",
    data.civil_status ? `Civil Status: ${data.civil_status}` : "",
    data.nationality ? `Nationality: ${data.nationality}` : "",
    data.availability ? `Available: ${data.availability}` : "",
    data.job_type ? `Job Type: ${data.job_type}` : "",
  ].filter(Boolean).map(p => `<p class="sidebar-text">${p}</p>`).join("");

  const skillItems = (data.skills || "").split(",").map(s => s.trim()).filter(Boolean)
    .map(s => `<p class="skill-line">${s}</p>`).join("");

  const eduItems = (data.education || []).filter(e => e.school || e.degree)
    .map(e => `<p class="sidebar-text"><strong>${e.degree || ""}</strong>${e.school ? ` — ${e.school}` : ""}${e.year ? ` | ${e.year}` : ""}</p>`).join("");

  const certItems = (data.certifications || []).filter(c => c.name)
    .map(c => `<p class="sidebar-text">${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}</p>`).join("");

  const langItems = (data.languages || []).filter(l => l.language)
    .map(l => `<p class="sidebar-text">${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}</p>`).join("");

  const expItems = (data.work_experience || []).filter(j => j.company || j.role)
    .map(j => `
      <p class="job-title">${j.role || ""}${j.company ? ` — ${j.company}` : ""}${j.duration ? ` | ${j.duration}` : ""}</p>
      ${(j.responsibilities || "").split("\n").filter(Boolean).map(b =>
        `<div class="bullet"><span class="bullet-dot">•</span><span>${b.trim()}</span></div>`
      ).join("")}
    `).join("");

  const seminarItems = (data.seminars || []).filter(s => s.title)
    .map(s => `<div class="bullet"><span class="bullet-dot">•</span><span>${s.title}${s.organizer ? ` — ${s.organizer}` : ""}${s.year ? ` (${s.year})` : ""}</span></div>`).join("");

  const refItems = (data.references || []).filter(r => r.name)
    .map(r => `<div class="bullet"><span class="bullet-dot">•</span><span>${r.name}${r.position ? `, ${r.position}` : ""}${r.company ? ` — ${r.company}` : ""}${r.contact ? ` | ${r.contact}` : ""}</span></div>`).join("");

  // Get summary from the live element (AI-generated)
  const summaryEl = el.querySelector("p.text-xs.text-slate-700.leading-relaxed");
  const summaryText = summaryEl?.innerText || "";

  return `
    <div class="resume-header">
      <div class="resume-photo">${photoHTML}</div>
      <div>
        <div class="resume-name">${getName()}</div>
        <div class="resume-role">${getRole()}</div>
      </div>
    </div>
    <div class="resume-body">
      <div class="resume-sidebar">
        ${contactItems ? `<div class="sidebar-section"><div class="sidebar-title">Contact</div>${contactItems}</div>` : ""}
        ${personalItems ? `<div class="sidebar-section"><div class="sidebar-title">Personal Info</div>${personalItems}</div>` : ""}
        ${skillItems ? `<div class="sidebar-section"><div class="sidebar-title">Skills</div>${skillItems}</div>` : ""}
        ${eduItems ? `<div class="sidebar-section"><div class="sidebar-title">Education</div>${eduItems}</div>` : ""}
        ${certItems ? `<div class="sidebar-section"><div class="sidebar-title">Certifications</div>${certItems}</div>` : ""}
        ${langItems ? `<div class="sidebar-section"><div class="sidebar-title">Languages</div>${langItems}</div>` : ""}
      </div>
      <div class="resume-main">
        ${summaryText ? `<div class="main-section"><div class="main-title">Professional Summary</div><p class="summary-text">${summaryText}</p></div>` : ""}
        ${expItems ? `<div class="main-section"><div class="main-title">Work Experience</div>${expItems}</div>` : ""}
        ${seminarItems ? `<div class="main-section"><div class="main-title">Seminars & Trainings</div>${seminarItems}</div>` : ""}
        ${refItems ? `<div class="main-section"><div class="main-title">Character References</div>${refItems}</div>` : ""}
      </div>
    </div>
  `;
}