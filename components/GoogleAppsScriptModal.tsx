'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, ExternalLink, HelpCircle } from 'lucide-react';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleAppsScriptModal({ isOpen, onClose }: GoogleAppsScriptModalProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'index'>('code');
  const [copied, setCopied] = useState(false);
  const [codeGsContent, setCodeGsContent] = useState<string>('');
  const [indexHtmlContent, setIndexHtmlContent] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      // Fetch or read Code.gs and Index.html content
      fetch('/api/apps-script-source')
        .then((res) => res.json())
        .then((data) => {
          if (data.codeGs) setCodeGsContent(data.codeGs);
          if (data.indexHtml) setIndexHtmlContent(data.indexHtml);
        })
        .catch(() => {
          // Fallback static
          setCodeGsContent(`function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentContent = activeTab === 'code' ? codeGsContent : indexHtmlContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'code' ? 'Code.gs' : 'Index.html';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Kode Google Apps Script</h3>
              <p className="text-xs text-slate-400">
                Deploy mandiri ke script.google.com sebagai Web App gratis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deployment Guide Banner */}
        <div className="bg-sky-50 border-b border-sky-100 p-3 text-xs text-sky-900 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Langkah Cepat Deploy:</strong>
            <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-slate-700">
              <li>
                Buka{' '}
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                >
                  script.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                dan klik <em>Project Baru</em>.
              </li>
              <li>Salin isi tab <strong>Code.gs</strong> ke dalam file <code>Code.gs</code>.</li>
              <li>
                Klik tanda <strong>+</strong> lalu pilih <strong>HTML</strong>, beri nama{' '}
                <code>Index</code>, dan salin isi tab <strong>Index.html</strong>.
              </li>
              <li>
                Klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment Baru</strong> &gt;
                pilih <strong>Aplikasi Web</strong> &gt; Akses: <em>Siapa saja (Anyone)</em>.
              </li>
            </ol>
          </div>
        </div>

        {/* Tab Controls & Copy / Download Toolbar */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'code' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Code.gs
            </button>
            <button
              onClick={() => setActiveTab('index')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'index' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Index.html
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300">
          <pre className="whitespace-pre">{currentContent || 'Memuat kode...'}</pre>
        </div>
      </div>
    </div>
  );
}
