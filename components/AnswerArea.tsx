import React, { useState } from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  onSubmit: (answer: string) => void;
  isEvaluating: boolean;
}

export const AnswerArea: React.FC<Props> = ({ question, onSubmit, isEvaluating }) => {
  const [answer, setAnswer] = useState('');

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 flex flex-col h-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl text-white font-serif italic mb-2">"{question.question_text}"</h2>
        <div className="flex gap-2">
             <span className="text-xs text-slate-500">Targeting:</span>
             {question.targets.map(t => <span key={t} className="text-xs text-brand-400">{t}</span>)}
        </div>
      </div>

      <textarea
        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans leading-relaxed"
        placeholder="Synthesize your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isEvaluating}
      />

      <div className="mt-4 flex justify-end items-center gap-4">
        <span className="text-xs text-slate-600">
           {answer.length < 50 ? 'Answer must be substantive.' : `${answer.split(' ').length} words`}
        </span>
        <button
          onClick={() => onSubmit(answer)}
          disabled={isEvaluating || answer.length < 50}
          className={`
            px-6 py-2 rounded-lg font-bold text-sm transition-all
            ${isEvaluating || answer.length < 50 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10'}
          `}
        >
          {isEvaluating ? 'Evaluating...' : 'Submit Response'}
        </button>
      </div>
    </div>
  );
};