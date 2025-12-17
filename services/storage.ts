import { SessionData, AppState } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'ct_sessions',
};

export const storageService = {
  /**
   * Saves the current application state as a session linked to the User ID.
   */
  saveSession: (userId: string, state: AppState, sessionId: string, title?: string) => {
    if (!state.documentText || !state.intelligence) return;

    const sessionsRaw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: SessionData[] = sessionsRaw ? JSON.parse(sessionsRaw) : [];

    const existingIndex = sessions.findIndex(s => s.id === sessionId);
    
    const sessionData: SessionData = {
      id: sessionId,
      userId: userId, // Linked to the JWT subject (User ID)
      timestamp: existingIndex >= 0 ? sessions[existingIndex].timestamp : Date.now(),
      title: title || (existingIndex >= 0 ? sessions[existingIndex].title : "Untitled Session"),
      documentText: state.documentText,
      intelligence: state.intelligence,
      questions: state.questions,
      currentQuestionId: state.currentQuestionId,
      learnerMemory: state.learnerMemory,
      evaluations: state.evaluations
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.push(sessionData);
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  /**
   * Retrieves all sessions for a specific User ID.
   */
  getSessionsByUser: (userId: string): SessionData[] => {
    const sessionsRaw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: SessionData[] = sessionsRaw ? JSON.parse(sessionsRaw) : [];
    return sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
};