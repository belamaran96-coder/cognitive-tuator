import React from 'react';
import { DocumentIntelligence, LearnerMemory } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Props {
  intelligence: DocumentIntelligence;
  memory: LearnerMemory;
}

export const Dashboard: React.FC<Props> = ({ intelligence, memory }) => {
  // Transform difficulty map for chart
  const chartData = Object.entries(intelligence.difficulty_map).map(([subject, A]) => ({
    subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
    A,
    fullMark: 10,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
      {/* Doc Intelligence Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
        <h3 className="text-brand-400 text-sm font-mono uppercase tracking-wider mb-4">Document Topology</h3>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Complexity" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            {intelligence.core_themes.slice(0, 3).map((t, i) => (
                <span key={i} className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700">{t}</span>
            ))}
        </div>
      </div>

      {/* Learner Memory Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col">
        <h3 className="text-blue-400 text-sm font-mono uppercase tracking-wider mb-4">Learner Profile (Memory)</h3>
        
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs text-slate-500 uppercase block mb-1">Confirmed Strengths</span>
            {memory.strengths.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {memory.strengths.map((s, i) => (
                   <span key={i} className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-900/50 text-xs rounded">{s}</span>
                 ))}
               </div>
            ) : (
                <p className="text-slate-600 text-sm italic">No data yet. Answer questions to build profile.</p>
            )}
          </div>
          
          <div>
            <span className="text-xs text-slate-500 uppercase block mb-1">Identified Gaps</span>
             {memory.gaps.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {memory.gaps.map((s, i) => (
                   <span key={i} className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-900/50 text-xs rounded">{s}</span>
                 ))}
               </div>
            ) : (
                <p className="text-slate-600 text-sm italic">No gaps identified yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};