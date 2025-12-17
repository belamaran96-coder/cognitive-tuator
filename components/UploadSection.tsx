import React, { useState, ChangeEvent } from 'react';

interface Props {
  onProcess: (text: string) => void;
  isProcessing: boolean;
}

export const UploadSection: React.FC<Props> = ({ onProcess, isProcessing }) => {
  const [text, setText] = useState('');

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple text file reader. For PDF, in a real app, we'd use pdf.js here.
    // For this hackathon demo code, we assume text extract or txt file.
    if (file.type === 'text/plain') {
      const content = await file.text();
      setText(content);
    } else {
      alert("For this demo, please copy-paste your PDF text or upload a .txt file.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">Initialize Cognitive Context</h2>
      <p className="text-slate-400 mb-6">
        Upload a document (or paste text) to begin deep analysis. The system reads once, then tutors you indefinitely.
      </p>

      <div className="space-y-4">
        <textarea
          className="w-full h-48 bg-slate-950 text-slate-200 p-4 rounded-lg border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono text-sm resize-none"
          placeholder="Paste article, paper, or notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-between">
          <div className="relative">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label 
              htmlFor="file-upload"
              className="text-sm text-brand-400 hover:text-brand-300 cursor-pointer transition-colors"
            >
              Or upload .txt file
            </label>
          </div>

          <button
            onClick={() => onProcess(text)}
            disabled={!text.trim() || isProcessing}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              !text.trim() || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50'
            }`}
          >
            {isProcessing ? 'Analyzing Structure...' : 'Start Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};