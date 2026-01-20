import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

type AuthProps = {
  onLogin?: () => void;
};

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha"
];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Avatar
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', avatar: AVATARS[0]
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleNextStep = () => {
    if (formData.password !== formData.confirmPassword) {
      return setMessage({ text: "Passwords match nahi kar rahe!", type: 'error' });
    }
    setStep(2);
  };

  const handleFinalSignup = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name, photoURL: formData.avatar });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        createdAt: new Date()
      });

      onLogin?.();
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onLogin?.();
    } catch (error: any) {
      setMessage({ text: "Ghalat Email ya Password!", type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {isSignup && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full bg-blue-500 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
          </div>
        )}

        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
            {isSignup ? (step === 1 ? 'Join Us' : 'Choose Avatar') : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">
            {isSignup ? 'Apna AI transcription safar shuru karein' : 'Apna account login karein'}
          </p>

          {isSignup && step === 2 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                {AVATARS.map((url, index) => (
                  <div 
                    key={index}
                    onClick={() => setFormData({...formData, avatar: url})}
                    className={`cursor-pointer p-2 rounded-xl border-2 transition-all ${formData.avatar === url ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                  >
                    <img src={url} alt="avatar" className="w-20 h-20 mx-auto" />
                  </div>
                ))}
              </div>
              <button onClick={handleFinalSignup} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                {loading ? 'Creating Account...' : 'Finish & Continue'}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-slate-500 text-sm">Back</button>
            </div>
          ) : (
            <form onSubmit={isSignup ? (e) => { e.preventDefault(); handleNextStep(); } : handleLogin} className="space-y-4">
              {isSignup && (
                <input 
                  type="text" placeholder="Full Name" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              )}
              <input 
                type="email" placeholder="Email Address" required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Password" required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {isSignup && (
                <input 
                  type="password" placeholder="Confirm Password" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                {isSignup ? 'Next Step' : (loading ? 'Logging in...' : 'Sign In')}
              </button>
            </form>
          )}

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => { setIsSignup(!isSignup); setStep(1); setMessage({text:'', type:''}); }}
              className="text-blue-500 dark:text-blue-400 text-sm font-semibold hover:underline"
            >
              {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
            
            {!isSignup && (
              <p onClick={async () => {
                if(!formData.email) return setMessage({text: "Pehle email likhein!", type:'error'});
                await sendPasswordResetEmail(auth, formData.email);
                setMessage({text: "Reset link bhej diya gaya!", type:'success'});
              }} className="text-slate-400 text-xs cursor-pointer hover:text-slate-200">
                Forgot Password?
              </p>
            )}
          </div>

          {message.text && (
            <div className={`mt-6 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};