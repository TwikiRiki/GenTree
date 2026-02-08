
import React, { useState, useEffect } from 'react';
import { User, HealthProfile, Language } from '../types';
import * as storage from '../services/storage';
import ProfileForm from './ProfileForm';

interface DashboardProps {
  currentUser: User;
  onSelectProfile: (id: string) => void;
  onDataChange: () => void;
  lang: Language;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onSelectProfile, onDataChange, lang, t }) => {
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  useEffect(() => {
    const allProfiles = storage.getProfiles();
    const filtered = allProfiles.filter(p => 
      p.ownerId === currentUser.id || p.sharedWith.includes(currentUser.email)
    );
    setProfiles(filtered);
  }, [currentUser.id, currentUser.email]);

  const handleAddProfile = (data: Partial<HealthProfile>) => {
    const newProfile: HealthProfile = {
      id: crypto.randomUUID(),
      name: data.name || 'Unknown',
      gender: data.gender || 'other',
      dateOfBirth: data.dateOfBirth || new Date().toISOString().split('T')[0],
      bloodType: data.bloodType,
      notes: data.notes,
      ownerId: currentUser.id,
      sharedWith: []
    };
    storage.saveProfile(newProfile);
    setProfiles(prev => [...prev, newProfile]);
    setIsAddingProfile(false);
    onDataChange();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.dashboard}</h1>
          <p className="text-slate-500">{t.dashboardSub}</p>
        </div>
        <button
          onClick={() => setIsAddingProfile(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.addProfile}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">{t.noProfiles}</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">{t.startByAdding}</p>
            <button
              onClick={() => setIsAddingProfile(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              {t.addFirstProfile}
            </button>
          </div>
        ) : (
          profiles.map((profile) => {
            const lastRecord = storage.getProfileLastRecord(profile.id);
            return (
              <div 
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {profile.name}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {t[profile.gender] || profile.gender} • {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} Yrs
                      </p>
                    </div>
                  </div>
                  {profile.ownerId !== currentUser.id && (
                    <span className="bg-amber-50 text-amber-600 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-100 uppercase">
                      {t.shared}
                    </span>
                  )}
                </div>

                {lastRecord ? (
                  <div className="space-y-3 pt-3 border-t border-slate-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t.latestBP}</span>
                      <span className="font-mono font-medium text-slate-900">{lastRecord.systolic}/{lastRecord.diastolic} <small className="text-slate-400">mmHg</small></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t.heartRate}</span>
                      <span className="font-mono font-medium text-slate-900">{lastRecord.heartRate} <small className="text-slate-400">bpm</small></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t.spo2}</span>
                      <span className="font-mono font-medium text-slate-900">{lastRecord.oxygenSaturation}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-2 text-right italic">
                      {t.updated}: {new Date(lastRecord.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-8 text-center text-slate-400 text-sm">
                    {t.noEntries}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isAddingProfile && (
        <ProfileForm 
          onSave={handleAddProfile} 
          onClose={() => setIsAddingProfile(false)} 
          t={t}
        />
      )}
    </div>
  );
};

export default Dashboard;
