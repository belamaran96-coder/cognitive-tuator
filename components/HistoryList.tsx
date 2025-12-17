import React from 'react';
import { SessionData } from '../types';
import { FileText, Calendar, ChevronRight, BarChart } from 'lucide-react';

interface Props {
  sessions: SessionData[];
  onSelect: (session: SessionData) => void;
  onNew: () => void;
}

export const HistoryList: React.FC<Props> = ({ sessions, onSelect, onNew }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Learning Journey</h2>
        <button 
          onClick={onNew}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-brand-900/20"
        >
          + New Analysis
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
          <p className="text-slate-500 mb-4">No documents analyzed yet.</p>
          <button onClick={onNew} className="text-brand-400 hover:underline">Start your first session</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => {
            const completedCount = Object.keys(session.evaluations).length;
            const totalCount = session.questions.length;
            const progress = Math.round((completedCount / totalCount) * 100);

            return (
              <div 
                key={session.id}
                onClick={() => onSelect(session)}
                className="group bg-slate-900 border border-slate-700 hover:border-brand-500/50 p-5 rounded-xl cursor-pointer transition-all hover:shadow-xl hover:shadow-brand-900/10 flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-brand-900/20 transition-colors">
                    <FileText className="text-brand-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-100 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart size={12} />
                        {completedCount}/{totalCount} Pathways Evaluated
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <div className="text-xs text-slate-500 mb-1">Progress</div>
                     <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${progress}%` }}></div>
                     </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};