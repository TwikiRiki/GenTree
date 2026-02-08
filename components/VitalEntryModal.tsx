
import React, { useState } from 'react';
import { VitalRecord } from '../types';

interface VitalEntryModalProps {
  onSave: (data: Partial<VitalRecord>) => void;
  onClose: () => void;
  t: any;
}

const VitalEntryModal: React.FC<VitalEntryModalProps> = ({ onSave, onClose, t }) => {
  const [formData, setFormData] = useState({
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    oxygenSaturation: 98,
    notes: '',
    datetime: new Date().toISOString().slice(0, 16)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      timestamp: new Date(formData.datetime).getTime()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {t.addVitals}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">{t.readingTime}</label>
            <input
              type="datetime-local"
              value={formData.datetime}
              onChange={e => setFormData({ ...formData, datetime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-2">BP (mmHg)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input required type="number" min="40" max="250" value={formData.systolic} onChange={e => setFormData({ ...formData, systolic: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg" placeholder="Sys" />
                  <div className="text-[10px] text-center text-slate-400 mt-1 uppercase font-bold">{t.systolic}</div>
                </div>
                <div className="text-2xl text-slate-300 font-light">/</div>
                <div className="flex-1">
                  <input required type="number" min="40" max="200" value={formData.diastolic} onChange={e => setFormData({ ...formData, diastolic: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg" placeholder="Dia" />
                  <div className="text-[10px] text-center text-slate-400 mt-1 uppercase font-bold">{t.diastolic}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">{t.heartRate} (bpm)</label>
              <input required type="number" min="30" max="250" value={formData.heartRate} onChange={e => setFormData({ ...formData, heartRate: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none font-bold text-lg text-center" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">{t.spo2} (%)</label>
              <input required type="number" min="50" max="100" value={formData.oxygenSaturation} onChange={e => setFormData({ ...formData, oxygenSaturation: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none font-bold text-lg text-center" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">{t.notes}</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900" placeholder="..." />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50">{t.cancel}</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100">{t.saveReading}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VitalEntryModal;
