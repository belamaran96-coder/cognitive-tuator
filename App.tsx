import React, { useState, useCallback, useEffect } from 'react';
import { AppState, INITIAL_MEMORY, DocumentIntelligence, Question, EvaluationResult, SessionData, User } from './types';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storage';
import { authService } from './services/authService';
import { UploadSection } from './components/UploadSection';
import { Dashboard } from './components/Dashboard';
import { QuestionList } from './components/QuestionList';
import { AnswerArea } from './components/AnswerArea';
import { FeedbackCard } from './components/FeedbackCard';
import { Spinner } from './components/Spinner';
import { Auth } from './components/Auth';
import { HistoryList } from './components/HistoryList';
import { LogOut, History, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  // User state now holds the full User object derived from the JWT
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [view, setView] = useState<'app' | 'history'>('app');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [state, setState] = useState<AppState>({
    stage: 'upload',
    documentText: null,
    intelligence: null,
    questions: [],
    currentQuestionId: null,
    learnerMemory: INITIAL_MEMORY,
    evaluations: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');

  // Auto-save effect: uses user.id for secure storage association
  useEffect(() => {
    if (user && sessionId && state.stage !== 'upload') {
      const title = state.intelligence?.core_themes?.[0] 
        ? `Analysis: ${state.intelligence.core_themes[0]}` 
        : `Document ${new Date().toLocaleTimeString()}`;
      
      storageService.saveSession(user.id, state, sessionId, title);
    }
  }, [state, user, sessionId]);

  // Load History
  const loadHistory = useCallback(() => {
    setView('history');
  }, []);

  // Restore Session
  const restoreSession = useCallback((session: SessionData) => {
    setSessionId(session.id);
    setState({
      stage: 'dashboard', 
      documentText: session.documentText,
      intelligence: session.intelligence,
      questions: session.questions,
      currentQuestionId: session.currentQuestionId,
      learnerMemory: session.learnerMemory,
      evaluations: session.evaluations
    });
    setView('app');
  }, []);

  // Start New
  const startNew = useCallback(() => {
    setSessionId(null);
    setState({
      stage: 'upload',
      documentText: null,
      intelligence: null,
      questions: [],
      currentQuestionId: null,
      learnerMemory: INITIAL_MEMORY,
      evaluations: {}
    });
    setView('app');
  }, []);

  // Step 1: Analyze Document
  const handleProcessDocument = useCallback(async (text: string) => {
    setIsLoading(true);
    setLoadingLabel('Analyzing concept topology with Gemini 3.0 Pro...');
    try {
      const data = await geminiService.analyzeDocument(text);
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      setState(prev => ({
        ...prev,
        stage: 'dashboard',
        documentText: text,
        intelligence: data.intelligence,
        questions: data.questions,
        currentQuestionId: data.questions[0].id
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to analyze document. Please ensure your API key is valid.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 2: Select Question
  const handleSelectQuestion = (q: Question) => {
    setState(prev => ({ ...prev, currentQuestionId: q.id }));
  };

  // Step 3: Evaluate Answer
  const handleSubmitAnswer = useCallback(async (answer: string) => {
    if (!state.currentQuestionId) return;

    const currentQuestion = state.questions.find(q => q.id === state.currentQuestionId);
    if (!currentQuestion) return;

    setIsLoading(true);
    setLoadingLabel('Evaluating reasoning against hidden rubrics...');
    try {
      const result = await geminiService.evaluateAnswer(
        currentQuestion,
        answer,
        state.learnerMemory
      );

      setState(prev => {
        const newStrengths = [...prev.learnerMemory.strengths, ...(result.updated_memory.strengths || [])];
        const newGaps = [...prev.learnerMemory.gaps, ...(result.updated_memory.gaps || [])];
        const uniqueStrengths = Array.from(new Set(newStrengths));
        const uniqueGaps = Array.from(new Set(newGaps));

        return {
          ...prev,
          evaluations: {
            ...prev.evaluations,
            [currentQuestion.id]: result
          },
          learnerMemory: {
            ...prev.learnerMemory,
            strengths: uniqueStrengths,
            gaps: uniqueGaps
          }
        };
      });

    } catch (err) {
      console.error(err);
      alert("Evaluation failed.");
    } finally {
      setIsLoading(false);
    }
  }, [state.currentQuestionId, state.questions, state.learnerMemory]);

  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    startNew();
  };

  // --- Render Logic ---

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // View: History List
  if (view === 'history') {
    // Fetch sessions for the specific authenticated user ID
    const sessions = storageService.getSessionsByUser(user.id);
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <header className="max-w-7xl mx-auto flex justify-between items-center p-4 lg:p-8 border-b border-slate-800">
           <h1 className="text-xl font-bold text-white flex items-center gap-2">
             <span onClick={() => setView('app')} className="cursor-pointer hover:text-brand-500">Cognitive Tutor</span>
             <span className="text-slate-600">/</span>
             <span className="text-slate-400">History</span>
           </h1>
           <div className="flex items-center gap-3">
             <span className="text-xs text-brand-500 font-mono hidden sm:inline-block">User: {user.username}</span>
             <button onClick={() => setView('app')} className="text-sm text-slate-400 hover:text-white">Back to App</button>
             <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 flex items-center gap-1"><LogOut size={14}/> Logout</button>
           </div>
        </header>
        <HistoryList sessions={sessions} onSelect={restoreSession} onNew={startNew} />
      </div>
    );
  }

  // View: Main App (Upload or Dashboard)
  if (state.stage === 'upload') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <header className="p-4 flex justify-end items-center gap-4 max-w-7xl mx-auto w-full">
           <span className="text-xs text-brand-500 font-mono hidden sm:inline-block">User: {user.username}</span>
           <button onClick={loadHistory} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><History size={16}/> My History</button>
           <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-sm"><LogOut size={16}/> Logout</button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {isLoading ? (
            <Spinner label={loadingLabel} />
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome, {user.username}</h1>
                <p className="text-brand-500 font-mono text-sm">Initialize a new cognitive session</p>
              </div>
              <UploadSection onProcess={handleProcessDocument} isProcessing={isLoading} />
            </>
          )}
        </div>
      </div>
    );
  }

  // View: Dashboard
  const currentQuestion = state.questions.find(q => q.id === state.currentQuestionId);
  const currentResult = state.currentQuestionId ? state.evaluations[state.currentQuestionId] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 lg:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Cognitive Tutor</h1>
          <span className="text-xs text-slate-500 font-mono">Session: {sessionId?.slice(0, 6)}...</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-brand-500 font-mono hidden sm:inline-block">{user.username}</span>
            <button onClick={startNew} className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs uppercase font-bold"><PlusCircle size={14}/> New</button>
            <button onClick={loadHistory} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs uppercase font-bold"><History size={14}/> History</button>
            <button onClick={handleLogout} className="text-slate-600 hover:text-red-400"><LogOut size={16}/></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {state.intelligence && (
          <Dashboard intelligence={state.intelligence} memory={state.learnerMemory} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* Left Panel: Questions */}
          <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
            <QuestionList 
              questions={state.questions} 
              evaluations={state.evaluations}
              onSelect={handleSelectQuestion}
              currentId={state.currentQuestionId}
            />
          </div>

          {/* Center/Right Panel: Workspace */}
          <div className="lg:col-span-9">
            {isLoading ? (
               <div className="h-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800">
                  <Spinner label={loadingLabel} />
               </div>
            ) : currentResult ? (
              // Show Result if evaluated
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="opacity-70 pointer-events-none">
                     {currentQuestion && <AnswerArea question={currentQuestion} onSubmit={() => {}} isEvaluating={true} />}
                </div>
                <FeedbackCard result={currentResult} />
              </div>
            ) : currentQuestion ? (
              // Show Answer Input
              <AnswerArea 
                question={currentQuestion} 
                onSubmit={handleSubmitAnswer} 
                isEvaluating={isLoading} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600">
                Select a pathway to begin.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;