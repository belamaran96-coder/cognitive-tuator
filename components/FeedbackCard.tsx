import React from 'react';
import { EvaluationResult } from '../types';

interface Props {
  result: EvaluationResult;
}

export const FeedbackCard: React.FC<Props> = ({ result }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 h-full overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-white font-bold text-lg">Evaluation Result</h2>
          <span className="text-brand-400 text-sm font-mono">{result.score_band}</span>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border-2 border-brand-500">
          <span className="text-brand-400 font-bold">{result.score_numerical}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Cognitive Strength</h4>
          <p className="text-green-300 text-sm bg-green-900/10 p-3 rounded border-l-2 border-green-500">
            {result.strength_analysis}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase text-slate-500 font-bold mb-2">Identified Gap</h4>
          <p className="text-red-300 text-sm bg-red-900/10 p-3 rounded border-l-2 border-red-500">
            {result.weakness_analysis}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase text-brand-500 font-bold mb-2">Tutor's Suggestion</h4>
          <div className="bg-brand-900/10 p-4 rounded-lg border border-brand-900/30">
            <p className="text-slate-200 text-sm leading-relaxed">
              {result.personalized_suggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};