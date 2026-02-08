
import React, { useState, useEffect, useMemo } from 'react';
import { User, HealthProfile, VitalRecord, Language } from '../types';
import * as storage from '../services/storage';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import VitalEntryModal from './VitalEntryModal';
import SharingModal from './SharingModal';
import { getHealthInsights } from '../services/gemini';

interface ProfileDetailProps {
  profileId: string;
  onBack: () => void;
  currentUser: User;
  lang: Language;
  t: any;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ profileId, onBack, currentUser, lang, t }) => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [insights, setInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    const p = storage.getProfileById(profileId);
    if (p) {
      setProfile(p);
      const r = storage.getProfileRecords(profileId);
      setRecords(r.sort((a, b) => a.timestamp - b.timestamp));
    }
  }, [profileId]);

  const handleAddRecord = (data: Partial<VitalRecord>) => {
    const newRecord: VitalRecord = {
      id: crypto.randomUUID(),
      patientId: profileId,
      timestamp: data.timestamp || Date.now(),
      systolic: data.systolic || 120,
      diastolic: data.diastolic || 80,
      heartRate: data.heartRate || 70,
      oxygenSaturation: data.oxygenSaturation || 98,
      notes: data.notes
    };
    storage.saveRecord(newRecord);
    setRecords(prev => [...prev, newRecord].sort((a, b) => a.timestamp - b.timestamp));
    setIsAddingRecord(false);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm(t.deleteConfirm)) {
      storage.deleteRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  const handleDownloadData = () => {
    if (records.length === 0) return;
    const headers = ['Timestamp', 'Systolic', 'Diastolic', 'Heart Rate', 'Oxygen Saturation', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => [
        new Date(r.timestamp).toISOString(),
        r.systolic,
        r.diastolic,
        r.heartRate,
        r.oxygenSaturation,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `health_data_${profile?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateInsights = async () => {
    if (!profile || records.length === 0) return;
    setIsGeneratingInsights(true);
    try {
      const insight = await getHealthInsights(profile, records);
      setInsights(insight);
    } catch (err) {
      console.error(err);
      setInsights(t.failedInsights);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const chartData = useMemo(() => {
    return records.map(r => ({
      time: new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      systolic: r.systolic,
      diastolic: r.diastolic,
      heartRate: r.heartRate,
      spo2: r.oxygenSaturation,
      rawTime: r.timestamp
    }));
  }, [records, lang]);

  if (!profile) return null;

  const isOwner = profile.ownerId === currentUser.id;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {profile.name}
              {profile.bloodType && (
                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100 uppercase tracking-tighter">
                  {profile.bloodType}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm">{t[profile.gender]} • DOB: {profile.dateOfBirth} • {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} {lang === 'it' ? 'anni' : 'years'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleDownloadData} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
            {t.exportCsv}
          </button>
          {isOwner && (
            <button onClick={() => setIsSharing(true)} className="flex-1 md:flex-none px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2">
              {t.shareProfile}
            </button>
          )}
          <button onClick={() => setIsAddingRecord(true)} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center justify-center gap-2">
            {t.addVitals}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Selector */}
        <div className="col-span-full flex justify-end">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setChartType('line')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'line' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{t.line}</button>
            <button onClick={() => setChartType('bar')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'bar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{t.bar}</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* BP Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
            {t.bpTrend}
          </h3>
          <div className="h-[350px]">
            {records.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{fontSize: 10}} height={50} />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={t.systolic} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={t.diastolic} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{fontSize: 10}} height={50} />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="systolic" fill="#ef4444" radius={[4, 4, 0, 0]} name={t.systolic} />
                    <Bar dataKey="diastolic" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.diastolic} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic">{t.noEntries}</div>}
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Heart Rate Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-400 rounded-full"></span>
                {t.heartRate}
              </h3>
              <div className="h-[300px]">
                {records.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <AreaChart data={chartData}>
                        <defs><linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/><stop offset="95%" stopColor="#fb7185" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="heartRate" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" name={t.heartRate} />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Bar dataKey="heartRate" fill="#fb7185" radius={[4, 4, 0, 0]} name={t.heartRate} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 italic">{t.noEntries}</div>}
              </div>
            </div>

            {/* SpO2 Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
                {t.spo2}
              </h3>
              <div className="h-[300px]">
                {records.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line type="stepAfter" dataKey="spo2" stroke="#22d3ee" strokeWidth={4} dot={{ r: 4 }} name={t.spo2} />
                      </LineChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Bar dataKey="spo2" fill="#22d3ee" radius={[4, 4, 0, 0]} name={t.spo2} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 italic">{t.noEntries}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Health Insights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">{t.healthInsights}</h3>
              <button
                onClick={generateInsights}
                disabled={isGeneratingInsights || records.length === 0}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-colors"
              >
                {isGeneratingInsights ? t.generatingInsights : t.refreshAI}
              </button>
            </div>

            {insights ? (
              <div className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                {insights.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-3 flex justify-center">
                  <div className="p-3 bg-blue-50 rounded-full text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4">{t.aiInsightsDesc}</p>
                <button
                  onClick={generateInsights}
                  disabled={records.length === 0}
                  className="w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  {t.analyzeTrends}
                </button>
              </div>
            )}
          </div>

          {/* History List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">{t.vitalsHistory}</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {records.slice().reverse().map(record => (
              <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(record.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <button 
                    onClick={() => handleDeleteRecord(record.id)} 
                    className="p-2 -mr-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-[10px] text-slate-400 uppercase">BP</div><div className="text-sm font-bold text-slate-700">{record.systolic}/{record.diastolic}</div></div>
                  <div><div className="text-[10px] text-slate-400 uppercase">HR</div><div className="text-sm font-bold text-slate-700">{record.heartRate}</div></div>
                  <div><div className="text-[10px] text-slate-400 uppercase">SpO2</div><div className="text-sm font-bold text-slate-700">{record.oxygenSaturation}%</div></div>
                </div>
                {record.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                    "{record.notes}"
                  </div>
                )}
              </div>
            ))}
            {records.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">{t.noEntries}</p>}
          </div>
          </div>
        </div>
      </div>

      {isAddingRecord && <VitalEntryModal onSave={handleAddRecord} onClose={() => setIsAddingRecord(false)} t={t} />}
      {isSharing && <SharingModal patient={profile} onClose={() => setIsSharing(false)} onShared={(u) => { storage.saveProfile(u); setProfile(u); }} t={t} />}
    </div>
  );
};

export default ProfileDetail;
