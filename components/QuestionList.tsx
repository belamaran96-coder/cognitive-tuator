import React from 'react';
import { Question, EvaluationResult } from '../types';

interface Props {
  questions: Question[];
  evaluations: Record<string, EvaluationResult>;
  onSelect: (q: Question) => void;
  currentId: string | null;
}

export const QuestionList: React.FC<Props> = ({ questions, evaluations, onSelect, currentId }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-lg mb-4">Assessment Pathways</h3>
      {questions.map((q, idx) => {
        const isCompleted = !!evaluations[q.id];
        const isSelected = currentId === q.id;
        
        return (
          <div 
            key={q.id}
            onClick={() => onSelect(q)}
            className={`
              group cursor-pointer p-4 rounded-lg border transition-all duration-300 relative overflow-hidden
              ${isSelected ? 'bg-slate-800 border-brand-500 shadow-lg shadow-brand-900/20' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${isCompleted ? 'bg-brand-900 text-brand-300' : 'bg-slate-800 text-slate-500'}`}>
                {isCompleted ? 'EVALUATED' : `PATHWAY 0${idx + 1}`}
              </span>
              {isCompleted && (
                 <span className="text-brand-400 font-bold text-sm">{evaluations[q.id].score_numerical}%</span>
              )}
            </div>
            
            <p className={`text-sm ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
              {q.question_text}
            </p>

            <div className="mt-3 flex gap-2">
                {q.targets.map(t => (
                    <span key={t} className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">{t}</span>
                ))}
            </div>

            {/* Completion Indicator Bar */}
            {isCompleted && (
                <div className="absolute bottom-0 left-0 h-1 bg-brand-500" style={{ width: `${evaluations[q.id].score_numerical}%` }} />
            )}
          </div>
        );
      })}
    </div>
  );
};