
import React, { useState } from 'react';
import { User, HealthProfile, Language } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileDetail from './components/ProfileDetail';
import Navbar from './components/Navbar';
import * as storage from './services/storage';
import { translations } from './translations';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getAuthUser());
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [refreshKey, setRefreshKey] = useState(0);

  const t = translations[lang];

  const handleLogin = (user: User) => {
    storage.setAuthUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setSelectedProfileId(null);
  };

  const refreshData = () => setRefreshKey(prev => prev + 1);

  if (!currentUser) {
    return <Login onLogin={handleLogin} lang={lang} t={t} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onHome={() => setSelectedProfileId(null)}
        lang={lang}
        onSetLang={setLang}
        t={t}
      />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {selectedProfileId ? (
          <ProfileDetail 
            profileId={selectedProfileId} 
            onBack={() => setSelectedProfileId(null)}
            currentUser={currentUser}
            lang={lang}
            t={t}
            key={`profile-${selectedProfileId}-${refreshKey}`}
          />
        ) : (
          <Dashboard 
            currentUser={currentUser} 
            onSelectProfile={setSelectedProfileId}
            onDataChange={refreshData}
            lang={lang}
            t={t}
            key={`dashboard-${refreshKey}`}
          />
        )}
      </main>
    </div>
  );
};

export default App;
