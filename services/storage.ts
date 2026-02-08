
import { User, HealthProfile, VitalRecord } from '../types';

const STORAGE_KEYS = {
  USER: 'vt_user',
  PROFILES: 'vt_patients', // Keeping key same for data persistence
  RECORDS: 'vt_records'
};

export const getAuthUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setAuthUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getProfiles = (): HealthProfile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return data ? JSON.parse(data) : [];
};

export const getProfileById = (id: string): HealthProfile | null => {
  return getProfiles().find(p => p.id === id) || null;
};

export const saveProfile = (profile: HealthProfile) => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

export const getRecords = (): VitalRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
};

export const getProfileRecords = (profileId: string): VitalRecord[] => {
  return getRecords().filter(r => r.patientId === profileId);
};

export const getProfileLastRecord = (profileId: string): VitalRecord | null => {
  const records = getProfileRecords(profileId);
  if (records.length === 0) return null;
  return records.sort((a, b) => b.timestamp - a.timestamp)[0];
};

export const saveRecord = (record: VitalRecord) => {
  const records = getRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const deleteRecord = (recordId: string) => {
  const records = getRecords().filter(r => r.id !== recordId);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};
