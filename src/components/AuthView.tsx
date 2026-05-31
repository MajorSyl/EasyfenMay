import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Phone, Lock, User, AlertCircle } from 'lucide-react';
import slImageUrl from '../assets/images/sierra_leone_bg_1780120225273.png';

export default function AuthView({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');
    setResetMessage('');
    
    try {
      await new Promise(r => setTimeout(r, 600));

      if (isForgotPassword) {
         setResetMessage('Password reset instructions sent to your email.');
      } else {
         onLogin(); // Simulated successful auth callback
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 absolute inset-0 z-[200]">
      {/* Background Image Header */}
      <div className="relative h-[45vh] w-full shrink-0">
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
        <img 
          src={slImageUrl} 
          alt="Sierra Leone Freetown Vibe" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-12 left-6 z-20">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Easyfen</h1>
          <p className="text-sky-300 font-bold text-sm tracking-wide uppercase">Sierra Leone's Marketplace</p>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="flex-1 flex flex-col z-20 -mt-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md mx-auto flex-1 flex flex-col mb-8"
        >
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setIsForgotPassword(false);
                setErrorMessage('');
                setResetMessage('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin && !isForgotPassword ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setIsForgotPassword(false);
                setErrorMessage('');
                setResetMessage('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin && !isForgotPassword ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            
            <AnimatePresence mode="popLayout">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 mb-2"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{errorMessage}</p>
                </motion.div>
              )}
              {resetMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 mb-2"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{resetMessage}</p>
                </motion.div>
              )}
              {!isLogin && !isForgotPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                       <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. John Kamara"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required={!isLogin}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                   <User size={18} />
                </div>
                <input 
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="hello@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {!isForgotPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 mb-2"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                       <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required={!isForgotPassword}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-2 w-full bg-sky-500 disabled:bg-sky-400 text-white font-bold h-14 rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-center transition-all active:scale-[0.98] gap-2"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            {isLogin && !isForgotPassword && (
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPassword(true);
                  setErrorMessage('');
                  setResetMessage('');
                }}
                className="text-sm font-bold text-slate-400 hover:text-sky-500 transition-colors mt-2"
              >
                Forgot password?
              </button>
            )}
            {isForgotPassword && (
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage('');
                  setResetMessage('');
                }}
                className="text-sm font-bold text-slate-400 hover:text-sky-500 transition-colors mt-2"
              >
                Back to Login
              </button>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
