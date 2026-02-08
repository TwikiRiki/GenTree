
import React, { useState, useEffect, useMemo } from 'react';
// Changed to HealthProfile to match types.ts
import { User, HealthProfile, VitalRecord } from '../types';
import * as storage from '../services/storage';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import VitalEntryModal from './VitalEntryModal';
import SharingModal from './SharingModal';
import { getHealthInsights } from '../services/gemini';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
  currentUser: User;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBack, currentUser }) => {
  const [patient, setPatient] = useState<HealthProfile | null>(null);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    // Fixed: Property 'getPatientById' was renamed to 'getProfileById' in storage.ts
    const p = storage.getProfileById(patientId);
    if (p) {
      setPatient(p);
      // Fixed: Property 'getPatientRecords' was renamed to 'getProfileRecords' in storage.ts
      const r = storage.getProfileRecords(patientId);
      setRecords(r.sort((a, b) => a.timestamp - b.timestamp));
    }
  }, [patientId]);

  const handleAddRecord = (data: Partial<VitalRecord>) => {
    const newRecord: VitalRecord = {
      id: crypto.randomUUID(),
      patientId,
      timestamp: Date.now(),
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
    link.download = `vital_track_${patient?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateInsights = async () => {
    if (!patient || records.length === 0) return;
    setIsGeneratingInsights(true);
    try {
      const insight = await getHealthInsights(patient, records);
      setInsights(insight);
    } catch (err) {
      console.error(err);
      setInsights('Failed to generate insights. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const chartData = useMemo(() => {
    return records.map(r => ({
      time: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      systolic: r.systolic,
      diastolic: r.diastolic,
      heartRate: r.heartRate,
      spo2: r.oxygenSaturation,
      rawTime: r.timestamp
    }));
  }, [records]);

  if (!patient) return null;

  const isOwner = patient.ownerId === currentUser.id;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {patient.name}
              {patient.bloodType && (
                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100 uppercase tracking-tighter">
                  Type {patient.bloodType}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm">
              {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} • DOB: {patient.dateOfBirth} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={handleDownloadData}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          {isOwner && (
            <button
              onClick={() => setIsSharing(true)}
              className="flex-1 md:flex-none px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Share Profile
            </button>
          )}
          <button
            onClick={() => setIsAddingRecord(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Vitals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {records.length > 0 ? (
            <>
              {/* BP Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                  Blood Pressure Trend
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Systolic (mmHg)" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Diastolic (mmHg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heart Rate & SpO2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-rose-400 rounded-full"></span>
                    Heart Rate
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="heartRate" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" name="HR (bpm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
                    Oxygen Saturation
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[80, 100]} hide />
                        <Tooltip />
                        <Line type="stepAfter" dataKey="spo2" stroke="#22d3ee" strokeWidth={3} dot={false} name="SpO2 (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[400px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <p>No data recorded yet to display charts</p>
            </div>
          )}
        </div>

        {/* Info & Insights Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Health Insights</h3>
              <button 
                onClick={generateInsights}
                disabled={isGeneratingInsights || records.length === 0}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300"
              >
                {isGeneratingInsights ? 'Analyzing...' : 'Refresh AI'}
              </button>
            </div>
            
            {insights ? (
              <div className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                {insights.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-2 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Get AI-powered health analysis based on the vitals history.</p>
                <button 
                  onClick={generateInsights}
                  disabled={records.length === 0}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  Analyze Trends
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Recent Logs</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {records.slice().reverse().map(record => (
                <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(record.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <button 
                      onClick={() => {
                        if(confirm('Delete this record?')) {
                          storage.deleteRecord(record.id);
                          setRecords(prev => prev.filter(r => r.id !== record.id));
                        }
                      }}
                      className="text-slate-300 hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-slate-400">BP</div>
                      <div className="text-sm font-bold text-slate-700">{record.systolic}/{record.diastolic}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">HR</div>
                      <div className="text-sm font-bold text-slate-700">{record.heartRate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">SpO2</div>
                      <div className="text-sm font-bold text-slate-700">{record.oxygenSaturation}%</div>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                      "{record.notes}"
                    </div>
                  )}
                </div>
              ))}
              {records.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">No entries yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {isAddingRecord && (
        <VitalEntryModal 
          onSave={handleAddRecord} 
          onClose={() => setIsAddingRecord(false)} 
        />
      )}

      {isSharing && (
        <SharingModal 
          patient={patient} 
          onClose={() => setIsSharing(false)} 
          onShared={(updatedPatient) => {
            // Fixed: Property 'savePatient' was renamed to 'saveProfile' in storage.ts
            storage.saveProfile(updatedPatient);
            setPatient(updatedPatient);
          }}
        />
      )}
    </div>
  );
};

export default PatientProfile;
