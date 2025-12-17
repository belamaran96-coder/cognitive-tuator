import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { LogIn, UserPlus, BrainCircuit } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      const { user, error } = authService.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError(error || 'Login failed');
      }
    } else {
      const { user, error } = authService.signup(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError(error || 'Sign up failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-900/30 rounded-full flex items-center justify-center mb-4 border border-brand-500/20">
            <BrainCircuit className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cognitive Tutor</h1>
          <p className="text-slate-400 mt-2">Sign in to track your mastery journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
              placeholder="learner123"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-400 hover:text-white text-sm underline"
          >
            {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};