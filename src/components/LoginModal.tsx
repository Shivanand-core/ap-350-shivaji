import React, { useState } from 'react';
import { X, Lock, Mail, Shield, AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import ShivajiCollegeLogo from './ShivajiCollegeLogo';
import { useJournal } from '../context/JournalContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal: 'editorial' | 'developer';
  onSuccess: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  targetPortal,
  onSuccess
}: LoginModalProps) {
  const { loginUser } = useJournal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await loginUser(email.trim(), password);
      setIsSubmitting(false);

      if (res.success && res.user) {
        // Role authorization check
        if (targetPortal === 'developer') {
          if (res.user.role !== 'superadmin' && (res.user.role as any) !== 'developer') {
            setErrorMsg('Access denied. Your account does not have permission to access the Developer Administration console.');
            return;
          }
        } else if (targetPortal === 'editorial') {
          if (res.user.role !== 'editor' && res.user.role !== 'reviewer' && res.user.role !== 'superadmin') {
            setErrorMsg('Access denied. Your account is not authorized for editorial review.');
            return;
          }
        }

        onSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your official email and password.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('An error occurred during authentication. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E3E62] p-6 text-center border-b border-slate-700 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <ShivajiCollegeLogo className="w-12 h-12" />
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-[#E0C58A] block mb-1">
            Shivaji College, University of Delhi
          </span>

          <h3 className="text-lg font-bold text-white font-cinzel">
            {targetPortal === 'developer' 
              ? 'Developer & Super Admin Console' 
              : 'Editorial & Referee Gateway'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {targetPortal === 'developer'
              ? 'Restricted to system developers and administrative stewards.'
              : 'Authorized access for Managing Editors and Faculty Referees.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {targetPortal === 'developer' ? 'Developer Admin Email ID *' : 'Institutional Email ID of Member *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={targetPortal === 'developer' ? 'work.shivanand@gmail.com' : 'e.g. principal@shivaji.du.ac.in, skawasthi@shivaji.du.ac.in'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500 font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Security Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to {targetPortal === 'developer' ? 'Console' : 'Editorial Desk'}</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </form>

        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          End-to-End Encrypted Session • Shivaji College, University of Delhi
        </div>
      </div>
    </div>
  );
}
