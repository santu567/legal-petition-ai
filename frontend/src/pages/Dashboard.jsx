import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../ThemeContext';

/* ─── Inline SVG Icons ─────────────────────────────────────────────── */
const Ico = {
  Scale: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"/><path d="M3 9l9-6 9 6"/><path d="M5 20h14"/><path d="M8 12H4l-1 5h18l-1-5h-4"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Predict: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Cases: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Explain: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Upload: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
       <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Alert: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Brain: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.63A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .46-1.63 2.5 2.5 0 0 1 4.54-3.37z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.63A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.46-1.63 2.5 2.5 0 0 0-4.54-3.37z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  )
};

const Spinner = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" className="animate-spin" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ─── UI COMPONENTS ─────────────────────────────────────────────────────── */

function ChatHistoryItem({ title, date, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm group mb-1 ${
        active 
          ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--deep)] shadow-sm' 
          : 'text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
      }`}
    >
      <div className={`flex-shrink-0 transition-colors ${active ? 'text-[var(--deep)]' : 'text-[var(--muted)] group-hover:text-[var(--gold)]'}`}>
        <Ico.FileText />
      </div>
      <div className="flex-1 truncate font-medium">{title}</div>
    </button>
  );
}

/* ─── RESULT COMPONENTS ─────────────────────────────────────────────────── */

function PetitionInputCard({ inputVal, setInputVal, handleSend, loading }) {
  const fileInputRef = React.useRef(null);
  const [extracting, setExtracting] = React.useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        
        // Ensure pdfjs is correctly configured
        const pdfjs = window.pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let textResult = "";
        // Limit to first 10 pages for performance and context relevance
        const maxPages = Math.min(pdf.numPages, 10);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          textResult += pageText + "\n";
        }
        
        // Clean and truncate
        const cleaned = textResult.replace(/[\x00-\x1F\x7F-\x9F]/g, "").substring(0, 20000);
        setInputVal(cleaned);
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const cleaned = result.value.replace(/[\x00-\x1F\x7F-\x9F]/g, "").substring(0, 20000);
        setInputVal(cleaned);
      } else {
        const reader = new FileReader();
        reader.onload = (re) => {
           const cleaned = re.target.result.replace(/[\x00-\x1F\x7F-\x9F]/g, "").substring(0, 20000);
           setInputVal(cleaned);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Extraction error:", err);
      alert("Failed to extract text. Is the file corrupted or protected?");
    } finally {
      setExtracting(false);
      e.target.value = null;
    }
  };

  return (
    <div className="result-card overflow-hidden mb-8 animate-in slide-in-from-top duration-500 shadow-2xl">
      <div className="p-6 border-b border-[var(--border-mute)] flex items-center justify-between bg-[var(--bg-btn-ghost)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[var(--gold)]">
            <Ico.FileText />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-0 leading-tight text-[var(--text-primary)]">Petition Decision Protocol</h3>
            <p className="text-xs text-[var(--muted)]">Upload documents or paste text for AI execution</p>
          </div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || extracting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-mute)] text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--deep)] transition-all disabled:opacity-50"
        >
          {extracting ? <Spinner size={10} /> : <Ico.Upload />}
          {extracting ? 'EXTRACTING...' : 'UPLOAD PDF/DOC'}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.txt" className="hidden" />
      </div>
      <div className="p-6">
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Paste full petition or upload file..."
          className="w-full h-64 bg-[var(--bg-input)] border border-[var(--border-mute)] rounded-xl p-5 text-[14px] leading-relaxed outline-none focus:border-[var(--gold)] transition-all resize-none placeholder-white/5 text-[var(--text-primary)]/90"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-[0.2em]">
            {inputVal.length} CHARACTERS_LOADED
          </div>
          <div className="flex items-center gap-3">
             {inputVal && <button onClick={() => setInputVal('')} className="text-[10px] font-bold text-red-400 opacity-60 hover:opacity-100 transition-opacity">CLEAR</button>}
             <button 
                onClick={handleSend}
                disabled={loading || extracting || !inputVal.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-[var(--text-primary)] rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-[#4C1D95]/40 disabled:opacity-50 disabled:grayscale"
             >
                {loading ? <Spinner size={16} /> : <Ico.Search />}
                {loading ? 'EXECUTING_PROTOCOL...' : 'ANALYZE PETITION'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionCard({ result }) {
  if (!result) return null;
  const isAdmitted = result.prediction === 'ADMITTED';
  const confidence = result.confidence || 0;
  
  return (
    <div className="result-card overflow-hidden mb-8 animate-in slide-in-from-top delay-100 duration-500">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[var(--gold)]">
             <Ico.Brain />
           </div>
           <h3 className="text-lg font-bold mb-0 text-[var(--text-primary)]">AI Prediction</h3>
        </div>
        <div className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-widest ${isAdmitted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
          {result.prediction}
        </div>
      </div>
      
      <div className="px-6 pb-8 space-y-6">
        {/* Confidence Banner */}
        <div className="bg-[#064e3b]/30 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
           <span className="text-xs font-bold text-emerald-100/70 uppercase tracking-tight">System Confidence: <span className="text-[var(--text-primary)] ml-1">{confidence}%</span></span>
           <div className="w-48 h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${confidence}%` }}></div>
           </div>
        </div>

        {/* Probability Bars */}
        <div className="space-y-4 pt-2">
           <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold tracking-wider">
                 <span className="flex items-center gap-2 text-emerald-400"><Ico.Check /> ADMISSION PROBABILITY</span>
                 <span className="text-emerald-400 font-mono">{result.admit_prob}%</span>
              </div>
              <div className="progress-bar-premium">
                 <div className="progress-fill-emerald" style={{ width: `${result.admit_prob}%` }}></div>
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold tracking-wider">
                 <span className="flex items-center gap-2 text-red-500"><Ico.X /> REJECTION PROBABILITY</span>
                 <span className="text-red-500 font-mono">{result.reject_prob}%</span>
              </div>
              <div className="progress-bar-premium">
                 <div className="progress-fill-red" style={{ width: `${result.reject_prob}%` }}></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CASE MODAL ────────────────────────────────────────────────────────── */

function PrecedentModal({ caseData, onClose }) {
  if (!caseData) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[var(--bg-card)] border border-[var(--border-mute)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-[var(--border-mute)] flex items-center justify-between bg-[rgba(201,168,76,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--deep)]">
              <Ico.FileText />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-0">Precedent Detail</h3>
              <div className="flex gap-4 mt-1">
                 <span className="text-[var(--gold)] text-xs font-mono">{caseData.similarity}% MATCH</span>
                 <span className={`text-xs font-bold ${caseData.outcome === 'ADMITTED' ? 'text-emerald-400' : 'text-red-400'}`}>{caseData.outcome}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-primary)]">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-[var(--text-primary)]/90 text-sm whitespace-pre-wrap">
          {caseData.excerpt}
          {"\n\n" + "-".repeat(50) + "\n\nFull Judgement Analysis Continued...\n\n" + caseData.excerpt.repeat(4)}
        </div>
        <div className="p-6 border-t border-[var(--border-mute)] flex justify-end gap-3 bg-[rgba(0,0,0,0.2)]">
           <button onClick={onClose} className="px-5 py-2 rounded-lg text-xs font-bold border border-[var(--border-mute)] hover:bg-white/5 transition-all text-[var(--text-primary)]/60">CLOSE</button>
           <button onClick={() => window.print()} className="px-5 py-2 rounded-lg text-xs font-bold bg-[var(--gold)] text-[var(--deep)] hover:scale-105 active:scale-95 transition-all">EXPORT PDF</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TRADING STYLE ANALYSIS CARD ───────────────────────────────────────── */

function LegalAnalysisCard({ result, onNodeClick }) {
  if (!result || !result.explanation) return null;
  
  const text = result.explanation;
  const isAdmitted = result.prediction === 'ADMITTED';

  // Robust Regex-based parser to handle markdown asterisks and flexible numbering
  const getSection = (num) => {
    const regex = new RegExp(`${num}\\.\\s*(?:\\*\\*)?[^\\*:]+(?:\\*\\*)?\\s*:\\s*([\\s\\S]*?)(?=\\n\\d\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "Data pending matrix execution...";
  };

  const labels = isAdmitted ? [
    "REASON FOR ADMISSION",
    "KEY STRENGTHS",
    "LEGAL GROUNDS TO STRENGTHEN",
    "EXPLANATION OF ADMISSION (SUMMARY)"
  ] : [
    "REASON FOR REJECTION",
    "REQUIRED IMPROVEMENTS TO REAPPLY",
    "LEGAL GROUNDS TO STRENGTHEN",
    "EXPLANATION OF REJECTION (SUMMARY)"
  ];

  const analysisMatrix = [
    { label: labels[0], content: getSection(1) },
    { label: labels[1], content: getSection(2) },
    { label: labels[2], content: getSection(3) },
    { label: labels[3], content: getSection(4) }
  ];
  
  return (
    <div className="result-card overflow-hidden mb-8 animate-in slide-in-from-top duration-700 shadow-2xl">
      <div className="p-4 border-b border-[var(--border-mute)] flex items-center justify-between bg-[var(--bg-input)]">
        <div className="flex items-center gap-3">
          <div className="text-[var(--gold)]"><Ico.Zap /></div>
          <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--text-primary)]/50 mb-0">Legal Analysis Matrix</h3>
        </div>
        <div className="text-[9px] font-mono text-[var(--muted)]">EXECUTION_NODE: GENERATIVE_V4</div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-white/[0.01] border-b border-[var(--border-mute)]/30">
                <th className="py-3 px-6 text-[9px] font-bold text-[var(--text-primary)]/20 uppercase tracking-widest w-1/3">Analysis Node</th>
                <th className="py-3 px-6 text-[9px] font-bold text-[var(--text-primary)]/20 uppercase tracking-widest">Detail & Determination</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-[#262b36]/20">
            {analysisMatrix.map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => onNodeClick && onNodeClick(row)}
                className="group hover:bg-[var(--bg-btn-ghost)] transition-all cursor-pointer border-b border-[var(--border-mute)]/20 last:border-0"
              >
                <td className="py-5 px-6 align-top">
                  <div className="text-[10px] font-bold text-[var(--gold)] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                    {row.label}
                  </div>
                </td>
                <td className="py-5 px-6 align-top">
                  <div className={`text-[13px] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors line-clamp-2 ${idx === 3 ? 'case-text-serif italic font-medium' : 'text-[var(--text-primary)]/80'}`}>
                    {row.content}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-2 text-[9px] text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">
                     Click to expand analysis →
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-4 text-[11px] text-yellow-200/60 mb-12 animate-in fade-in duration-1000 delay-300">
       <Ico.Alert />
       <span>This is an AI advisory tool only. Results do not constitute legal advice. Always consult a qualified legal professional before filing.</span>
    </div>
  );
}


/* ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [subView, setSubView] = useState(null); 
  const [user, setUser] = useState({ name: 'User', plan: 'Basic' });
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isToolsOpen, setToolsOpen] = useState(false);
  const [activeAnalysisNode, setActiveAnalysisNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const userRes = await axios.get('https://chnitu-legal-api.hf.space/api/auth/me', { headers });
        setUser(userRes.data);
        const historyRes = await axios.get('https://chnitu-legal-api.hf.space/api/history', { headers });
        setChats(historyRes.data.map(item => ({
          id: item.id,
          title: item.excerpt.substring(0, 35) + '...',
          date: item.date,
          full: item
        })));
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    setInputVal('');
    setSubView(null); // Return to analysis home
    setPredictionResult(null); // Clear previous results
    setSelectedCase(null); // Close case modal
    setActiveAnalysisNode(null); // Close matrix modal
    setToolsOpen(false); // Close intelligence hub
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const textToSend = inputVal.trim();
    if (!textToSend || loading) return;
    
    // Switch to analysis mode
    setLoading(true);
    setSubView(null);
    setPredictionResult(null); 

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('https://chnitu-legal-api.hf.space/api/analyze', { 
        text: textToSend, 
        generate_explanation: true 
      }, { headers, timeout: 120000 });
      
      setPredictionResult(res.data);
      setMessages([{ role: 'user', content: textToSend }, { role: 'ai', content: res.data.explanation }]);
      
      if (token) {
         const hRes = await axios.get('https://chnitu-legal-api.hf.space/api/history', { headers });
         setChats(hRes.data.map(item => ({ id: item.id, title: item.excerpt.substring(0, 35) + '...', date: item.date, full: item })));
      }
    } catch (err) {
      alert("Analysis failed. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[var(--bg-btn-ghost)]0 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`flex flex-col w-[280px] bg-[var(--bg-nav)] border-r border-[#1e232d] transition-transform duration-300 ease-in-out z-40 h-full absolute lg:relative shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
      }`}>
        <div className="p-4 flex flex-col gap-4 bg-[var(--bg-nav)]">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-[var(--gold)] scale-110"><Ico.Scale /></div>
            <div className="font-serif font-black text-xl tracking-tight text-[var(--text-primary)]">Legal<span className="text-[var(--gold)]">AI</span></div>
          </div>
          
          <button onClick={handleNewChat} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--bg-btn-ghost)] border border-[var(--border-mute)] hover:bg-white/[0.07] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all text-xs font-bold uppercase tracking-widest shadow-lg group">
            <Ico.Plus /> <span className="group-hover:translate-x-0.5 transition-transform">New Chat</span>
          </button>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/20 group-focus-within:text-[var(--gold)] transition-colors">
              <Ico.Search />
            </div>
            <input 
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-btn-ghost)] border border-[var(--border-mute)] rounded-xl py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[var(--gold)] focus:bg-white/[0.04] transition-all placeholder:text-[var(--text-primary)]/10 text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-primary)]/20 px-3 font-bold mb-4">Assessments</div>
          <div className="space-y-1">
            {chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <ChatHistoryItem key={c.id} title={c.title} date={c.date} active={activeChat === c.id} onClick={() => {
                  setActiveChat(c.id);
                  setPredictionResult(c.full);
                  setInputVal(c.full.excerpt);
                  setMessages([{ role: 'user', content: c.full.excerpt }, { role: 'ai', content: c.full.explanation }]);
                  setSubView(null);
                  setSelectedCase(null);
                }} />
              ))
            ) : (
              <div className="px-3 py-10 text-center">
                <div className="text-[var(--gold)] opacity-20 flex justify-center mb-2"><Ico.FileText /></div>
                <div className="text-[10px] text-[var(--text-primary)]/20 uppercase tracking-widest font-bold">No records found</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-black/20 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-btn-ghost)] border border-[var(--border-mute)] shadow-inner">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center text-[var(--deep)] font-black text-sm shadow-lg ring-1 ring-white/10">
              {user.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-[13px] font-bold truncate text-[var(--text-primary)]/90">{user.name}</div>
               <div className="text-[9px] text-[var(--gold)] font-mono uppercase tracking-[0.15em] font-bold">PRO_PROTOCOL_ACCESS</div>
            </div>
            <button onClick={logout} className="text-[var(--text-primary)]/20 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg">
              <Ico.Logout />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ANALYZER AREA ── */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[var(--bg-main)]">
        <header className="h-[70px] flex items-center justify-between px-8 border-b border-[var(--border-mute)] bg-[var(--bg-main)]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6">
             {!isSidebarOpen && ( <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--muted)]"><Ico.Dashboard /></button> )}
             <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]/60 uppercase">Judicial Intelligence</span>
                <span className="text-[#3a3f4b] text-base">|</span>
                <span className="text-[var(--gold)] text-[10px] font-mono tracking-[0.2em] font-bold">INLEGALBERT_V2.1</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {loading && <div className="text-[9px] text-[var(--gold)] font-mono animate-pulse tracking-widest">EXECUTING_LOGIC_MATRIX...</div>}
             
             <button 
                onClick={() => setToolsOpen(!isToolsOpen)}
                className={`p-2.5 rounded-xl transition-all shadow-lg ${isToolsOpen ? 'bg-[var(--gold)] text-[var(--deep)] scale-110' : 'text-[var(--gold)] bg-white/5 hover:bg-white/10'}`}
                title="Judicial Intelligence Hub"
             >
                <Ico.Zap />
             </button>

             <ThemeToggle />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 md:px-16 pt-10 pb-20 relative">
           {isToolsOpen && (
             <div className="absolute inset-x-0 top-0 z-30 animate-in slide-in-from-top duration-300">
                <div className="bg-[var(--bg-card)]/95 backdrop-blur-2xl border-b border-[var(--gold)]/20 shadow-2xl p-8">
                   <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                          { id: 'predict', icon: <Ico.Predict />, title: "Predict Admission", desc: "Forecast likelihood with SHAP analysis" },
                          { id: 'repository', icon: <Ico.Cases />, title: "Case Repository", desc: "Search 35k+ historical precedents" },
                          { id: 'explainability', icon: <Ico.Explain />, title: "Explainability", desc: "Layered factor-level transparency" },
                          { id: 'precedents', icon: <Ico.Search />, title: "Similar Cases", desc: "Run semantic precedent matching" }
                        ].map((t, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (t.id === 'predict') setSubView(null);
                              else setSubView(t.id);
                              setToolsOpen(false);
                            }}
                            className={`group p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                              (t.id === 'predict' && subView === null) || subView === t.id
                                ? 'bg-[var(--gold)]/10 border-[var(--gold)]'
                                : 'bg-[var(--bg-btn-ghost)] border-[var(--border-mute)] hover:border-[var(--gold)]/50 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                              (t.id === 'predict' && subView === null) || subView === t.id
                                ? 'bg-[var(--gold)] text-[var(--deep)]'
                                : 'bg-white/5 text-[var(--gold)]'
                            }`}>
                              {t.icon}
                            </div>
                            <h4 className="text-[var(--text-primary)] font-bold text-sm mb-1">{t.title}</h4>
                            <p className="text-[var(--text-tertiary)] text-[11px] leading-relaxed">{t.desc}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
             </div>
           )}

           <div className="max-w-4xl mx-auto">
              
              {subView === null && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Card 1: Input */}
                  <PetitionInputCard 
                    inputVal={inputVal} 
                    setInputVal={setInputVal} 
                    handleSend={handleSend} 
                    loading={loading} 
                  />

                  {/* Card 2: Prediction */}
                  {predictionResult && <PredictionCard result={predictionResult} />}

                  {/* Card 3: Analysis (Matrix Table) */}
                  {predictionResult && <LegalAnalysisCard result={predictionResult} onNodeClick={(node) => setActiveAnalysisNode(node)} />}
                </div>
              )}

              {subView === 'repository' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="result-card p-10 mb-8 border-[var(--gold)]/30">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="p-3 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]"><Ico.Cases /></div>
                         <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Precedent Repository</h2>
                            <p className="text-sm text-[var(--text-tertiary)] italic">Search through 35,000+ Supreme Court judgments</p>
                         </div>
                      </div>
                      <div className="relative mb-10 group">
                         <input 
                           type="text"
                           placeholder="Describe a case or legal scenario (e.g. Article 21 violations in custodial torture)..." 
                           className="w-full bg-black/40 border border-white/10 p-6 pl-14 rounded-2xl text-lg outline-none focus:border-[var(--gold)] transition-all placeholder:text-[var(--text-primary)]/10"
                         />
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/30 group-focus-within:text-[var(--gold)] transition-colors">
                            <Ico.Search />
                         </div>
                         <button className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--gold)] text-[var(--deep)] font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                            Run Query
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-40">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="p-5 rounded-2xl border border-dashed border-white/10 flex flex-col gap-3">
                              <div className="h-4 w-1/3 bg-white/5 rounded" />
                              <div className="h-3 w-full bg-white/5 rounded" />
                              <div className="h-3 w-4/5 bg-white/5 rounded" />
                           </div>
                         ))}
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/5 text-center">
                         <span className="text-[10px] text-[var(--text-primary)]/20 uppercase tracking-[0.3em] font-bold">Neural Engine Offline</span>
                      </div>
                   </div>
                </div>
              )}

              {subView === 'explainability' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="result-card p-10 mb-8 overflow-hidden bg-gradient-to-br from-[#161a23] to-[#0f1117]">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="p-3 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]"><Ico.Explain /></div>
                         <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Impact explainability</h2>
                            <p className="text-sm text-[var(--text-tertiary)] italic">Structural factor-level transparency of AI model weights</p>
                         </div>
                      </div>
                      {!predictionResult ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                           <div className="text-[var(--gold)] mb-4 flex justify-center opacity-20"><Ico.Zap /></div>
                           <p className="text-[var(--text-primary)]/20 text-sm font-medium tracking-wide">RUN AN ANALYSIS FIRST TO SECURE LOG DATA</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                           {[
                             { label: "Jurisdictional Validity", score: 92, impact: "+22%", detail: "Matches Article 32 writ protocol." },
                             { label: "Factual Substantiation", score: 45, impact: "-15%", detail: "Lacks corroborated evidentiary detail." },
                             { label: "Precedent Alignment", score: 78, impact: "+18%", detail: "High corelation with D.K. Basu v. State." },
                             { label: "Relief Clarity", score: 60, impact: "-5%", detail: "Ambiguous prayer for relief section." }
                           ].map((f, idx) => (
                             <div key={idx} className="p-6 rounded-2xl bg-[var(--bg-btn-ghost)] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center justify-between mb-4">
                                   <span className="text-sm font-bold text-[var(--text-primary)]/90">{f.label}</span>
                                   <span className={`text-xs font-mono font-bold ${f.impact.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{f.impact} Impact</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-3">
                                   <div 
                                     className={`h-full transition-all duration-1000 ${f.score > 70 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'bg-[var(--gold)]'}`} 
                                     style={{ width: `${f.score}%` }} 
                                   />
                                </div>
                                <p className="text-[11px] text-[var(--text-tertiary)]">{f.detail}</p>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              )}

              {subView === 'precedents' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {!predictionResult || !predictionResult.similar_cases?.length ? (
                      <div className="result-card p-10 text-center border-white/5 py-32">
                         <div className="text-[var(--gold)] opacity-20 flex justify-center mb-6"><Ico.Search /></div>
                         <p className="text-[var(--text-primary)]/20 text-sm font-bold tracking-widest uppercase">No Semantic Matches Loaded</p>
                      </div>
                    ) : (
                       <div className="result-card overflow-hidden mb-8 shadow-2xl">
                          <div className="p-6 bg-black/20 border-b border-[var(--border-mute)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="p-2.5 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] text-lg"><Ico.Cases /></div>
                               <div>
                                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-0">Semantic Precedent Matrix</h3>
                                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-mono">Precision Matching V2.1</p>
                               </div>
                            </div>
                            <div className="text-[9px] font-mono text-[var(--gold)] bg-[var(--gold)]/5 border border-[var(--gold)]/20 px-3 py-1 rounded-full animate-pulse">LIVE_SIGNAL_DETECTION</div>
                          </div>
                          <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                <thead>
                                   <tr className="bg-[var(--bg-btn-ghost)] border-b border-[var(--border-mute)]/50">
                                      <th className="py-4 px-6 text-[9px] font-bold text-[var(--text-primary)]/30 uppercase tracking-[0.2em] w-24">Signal</th>
                                      <th className="py-4 px-6 text-[9px] font-bold text-[var(--text-primary)]/30 uppercase tracking-[0.2em]">Legal Content Fragment</th>
                                      <th className="py-4 px-6 text-[9px] font-bold text-[var(--text-primary)]/30 uppercase tracking-[0.2em] w-24 text-center">Result</th>
                                      <th className="py-4 px-6 text-[9px] font-bold text-[var(--text-primary)]/30 uppercase tracking-[0.2em] w-28 text-right">Protocol</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-[#262b36]/40">
                                   {predictionResult.similar_cases.map((c, i) => (
                                     <tr key={i} className="group hover:bg-[rgba(201,168,76,0.03)] transition-all cursor-pointer" onClick={() => setSelectedCase(c)}>
                                        <td className="py-7 px-6">
                                           <div className="text-[14px] font-mono text-[var(--gold)] font-black">{c.similarity}%</div>
                                        </td>
                                        <td className="py-7 px-6">
                                           <div className="text-[13px] text-[var(--text-secondary)] line-clamp-1 italic group-hover:text-[var(--text-primary)] transition-colors">"{c.excerpt}"</div>
                                        </td>
                                        <td className="py-7 px-6 text-center">
                                           <span className={`px-4 py-1.5 rounded-3xl text-[10px] font-black tracking-widest uppercase ${c.outcome === 'ADMITTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                              {c.outcome}
                                           </span>
                                        </td>
                                        <td className="py-7 px-6 text-right">
                                           <button onClick={(e) => { e.stopPropagation(); setSelectedCase(c); }} className="text-[9px] font-bold text-[var(--gold)] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-[var(--gold)] hover:text-[var(--deep)] transition-all flex items-center justify-end gap-2 ml-auto shadow-sm">
                                              VIEW ANALYSIS
                                           </button>
                                        </td>
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    )}
                </div>
              )}

              {/* Disclaimer */}
              <Disclaimer />

           </div>
        </section>

        {/* Full Case Modal Container */}
        {selectedCase && <PrecedentModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />}

        {/* Legal Analysis Node Deep-Dive Modal */}
        {activeAnalysisNode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setActiveAnalysisNode(null)} />
             <div className="relative bg-[var(--bg-card)] border border-[var(--gold)]/30 rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="flex items-center justify-between p-7 border-b border-white/5 bg-gradient-to-r from-[var(--gold)]/10 to-transparent">
                   <div>
                      <div className="text-[9px] text-[var(--gold)] font-black uppercase tracking-[0.4em] mb-1">Analytical Execution Node</div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight uppercase">{activeAnalysisNode.label}</h2>
                   </div>
                   <button onClick={() => setActiveAnalysisNode(null)} className="p-2 text-[var(--text-primary)]/30 hover:text-[var(--text-primary)] bg-white/5 rounded-xl transition-all">
                      <Ico.X />
                   </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar bg-black/20">
                   <div className="text-[var(--text-primary)]/90 text-[15px] leading-[1.8] font-medium whitespace-pre-wrap">
                      {activeAnalysisNode.content}
                   </div>
                </div>
                <div className="p-6 border-t border-white/5 flex justify-end">
                   <button 
                      onClick={() => setActiveAnalysisNode(null)}
                      className="px-6 py-2.5 rounded-xl bg-[var(--gold)] text-[var(--deep)] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                   >
                      Exit Node Detail
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}