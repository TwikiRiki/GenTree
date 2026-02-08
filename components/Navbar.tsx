
import React from 'react';
import { User, Language } from '../types';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onHome: () => void;
  lang: Language;
  onSetLang: (l: Language) => void;
  t: any;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onHome, lang, onSetLang, t }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onHome}
        >
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800">{t.appName}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => onSetLang('en')}
              className={`px-2 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onSetLang('it')}
              className={`px-2 py-1 text-xs font-bold rounded ${lang === 'it' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              IT
            </button>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900">{currentUser.name}</span>
            <span className="text-xs text-slate-500">{currentUser.email}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
