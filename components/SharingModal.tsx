
import React, { useState } from 'react';
import { HealthProfile } from '../types';

interface SharingModalProps {
  patient: HealthProfile;
  onClose: () => void;
  onShared: (patient: HealthProfile) => void;
  t: any;
}

const SharingModal: React.FC<SharingModalProps> = ({ patient, onClose, onShared, t }) => {
  const [email, setEmail] = useState('');

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const updated = { ...patient, sharedWith: [...patient.sharedWith, email] };
    onShared(updated);
    setEmail('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{t.shareProfile}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleShare} className="space-y-4">
            <div className="flex gap-2">
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 outline-none text-slate-900" placeholder="email@example.com" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">{t.invite}</button>
            </div>
          </form>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.shareWith}</h3>
            {patient.sharedWith.map(e => (
              <div key={e} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-900">
                <span className="text-sm font-medium">{e}</span>
                <button onClick={() => onShared({ ...patient, sharedWith: patient.sharedWith.filter(i => i !== e) })} className="text-xs text-red-500 font-bold">{t.remove}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingModal;
