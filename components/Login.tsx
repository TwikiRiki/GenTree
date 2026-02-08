
import React, { useState } from 'react';
import { User, Language } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, t }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: email,
      email,
      name: name || email.split('@')[0]
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">{t.appName}</h1>
          <p className="text-slate-500 mt-2">{t.welcome}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.fullName}</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all">
            {isRegistering ? t.signUp : t.signIn}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            {isRegistering ? t.alreadyAccount : t.noAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
