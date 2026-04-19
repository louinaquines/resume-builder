import fs from 'fs';
import path from 'path';

function processStepForm() {
  const file = path.join(process.cwd(), 'src/components/StepForm.jsx');
  let text = fs.readFileSync(file, 'utf8');

  text = text.replace(
      'const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";',
      'const inp = "w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-[#0a0a0f]/50 text-white placeholder-slate-500 transition-all duration-300";'
  )
  text = text.replace(
      'const lbl = "block text-sm font-medium text-gray-700 mb-1";',
      'const lbl = "block text-sm font-medium text-slate-300 mb-1.5";'
  )
  text = text.replace(
      'const sec = "space-y-4";',
      'const sec = "space-y-6";'
  )
  text = text.replace(
      'const card = "border border-gray-200 rounded-xl p-4 space-y-3";',
      'const card = "border border-white/10 bg-white/5 rounded-xl p-5 space-y-4";'
  )
  text = text.replace(
      '<div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl">',
      '<div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-8 w-full max-w-xl">'
  )

  // Progress indicator
  text = text.replace(
      'className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold\n              ${step >= n ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}',
      'className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-md border\n              ${step >= n ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/5 text-slate-400 border-white/10"}`}'
  )
  text = text.replace(
      'className={`flex-1 h-1 rounded ${step > n ? "bg-indigo-600" : "bg-gray-200"}`}',
      'className={`flex-1 h-1 rounded transition-all duration-300 ${step > n ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-white/10"}`}'
  )

  // Photo upload
  text = text.replace(
      '<circle cx="40" cy="40" r="40" fill="#e5e7eb"/>\n                    <circle cx="40" cy="32" r="13" fill="#9ca3af"/>\n                    <ellipse cx="40" cy="68" rx="22" ry="14" fill="#9ca3af"/>',
      '<circle cx="40" cy="40" r="40" fill="#1e293b"/>\n                    <circle cx="40" cy="32" r="13" fill="#475569"/>\n                    <ellipse cx="40" cy="68" rx="22" ry="14" fill="#475569"/>'
  )

  // Global replaces for text colors
  text = text.replaceAll('text-gray-800 text-lg', 'text-white text-xl tracking-tight')
  text = text.replaceAll('text-gray-700', 'text-slate-300')
  text = text.replaceAll('text-gray-400', 'text-slate-400')
  text = text.replaceAll('text-gray-500', 'text-slate-400')
  text = text.replaceAll('text-gray-600', 'text-slate-300')
  text = text.replaceAll('border-gray-300', 'border-white/10')

  text = text.replaceAll('hover:border-indigo-400', 'hover:border-indigo-500')
  text = text.replaceAll('text-indigo-600 hover:underline', 'text-indigo-400 font-medium hover:text-indigo-300 hover:underline')
  text = text.replaceAll('text-indigo-500 uppercase', 'text-indigo-400 uppercase tracking-wider')
  text = text.replaceAll('text-red-400 hover:text-red-600', 'text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1 rounded-lg transition-colors')

  // Job type / Tone Selection
  text = text.replaceAll(
      'bg-indigo-600 text-white border-indigo-600',
      'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
  )

  // Bottom Nav buttons
  text = text.replace(
      'text-sm text-gray-500 hover:text-gray-700',
      'text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors'
  )
  text = text.replace(
      '<button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"',
      '<button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-indigo-500 transition-all duration-300"'
  )
  text = text.replace(
      '<button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"',
      '<button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"'
  )

  fs.writeFileSync(file, text);
}

function processResumePreview() {
  const file = path.join(process.cwd(), 'src/components/ResumePreview.jsx');
  let text = fs.readFileSync(file, 'utf8');

  // Replace Loading State
  text = text.replace(
      '<div className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl flex items-center gap-2 text-gray-400 text-sm">\n        <span className="animate-pulse">✦</span> Generating your resume...\n      </div>',
      '<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-10 w-full max-w-2xl flex flex-col items-center justify-center gap-4 text-slate-300 min-h-[400px]">\n        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>\n        <p className="text-lg font-medium tracking-wide">Generating your resume<span className="animate-pulse">...</span></p>\n      </div>'
  )

  // Wrapper div styling
  text = text.replace(
      '<div style={{ width: `${PAGE_WIDTH_PX * SCALE}px`, height: `${PAGE_HEIGHT_PX * SCALE}px`, overflow: "hidden", position: "relative", flexShrink: 0 }}>\n        <div className="bg-white shadow overflow-hidden" style={{',
      '<div className="ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden relative flex-shrink-0 bg-white" style={{ width: `${PAGE_WIDTH_PX * SCALE}px`, height: `${PAGE_HEIGHT_PX * SCALE}px` }}>\n        <div className="bg-white overflow-hidden" style={{'
  )

  fs.writeFileSync(file, text);
}

processStepForm();
processResumePreview();
console.log('Transformation complete!');
