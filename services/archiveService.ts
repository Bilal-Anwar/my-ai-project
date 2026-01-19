import { ArchiveRecord, Folder, AnalysisResult } from '../types';

const STORAGE_KEY = 'gemini_transcriber_archive_v1';

interface ArchiveData {
  records: ArchiveRecord[];
  folders: Folder[];
}

const getStorageData = (): ArchiveData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    records: [],
    folders: [
        { id: 'default', name: 'General' },
        { id: 'meetings', name: 'Meetings' },
        { id: 'interviews', name: 'Interviews' }
    ]
  };
};

const setStorageData = (data: ArchiveData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveRecord = (title: string, result: AnalysisResult, mimeType: string, folderId: string = 'default'): ArchiveRecord => {
  const data = getStorageData();
  const newRecord: ArchiveRecord = {
    id: crypto.randomUUID(),
    title,
    date: new Date().toISOString(),
    folderId,
    result,
    mimeType
  };
  
  data.records.unshift(newRecord); // Add to beginning
  setStorageData(data);
  return newRecord;
};

export const getRecords = (): ArchiveRecord[] => {
  return getStorageData().records;
};

export const getFolders = (): Folder[] => {
  return getStorageData().folders;
};

export const createFolder = (name: string): Folder => {
  const data = getStorageData();
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name
  };
  data.folders.push(newFolder);
  setStorageData(data);
  return newFolder;
};

export const deleteRecord = (id: string) => {
  const data = getStorageData();
  data.records = data.records.filter(r => r.id !== id);
  setStorageData(data);
};

export const moveRecord = (recordId: string, folderId: string) => {
  const data = getStorageData();
  const record = data.records.find(r => r.id === recordId);
  if (record) {
    record.folderId = folderId;
    setStorageData(data);
  }
};

export const searchRecords = (query: string): ArchiveRecord[] => {
  const data = getStorageData();
  const lowerQuery = query.toLowerCase();
  
  return data.records.filter(record => {
    return (
      record.title.toLowerCase().includes(lowerQuery) ||
      record.result.summary.toLowerCase().includes(lowerQuery) ||
      record.result.transcription.toLowerCase().includes(lowerQuery) ||
      record.result.keyPoints.some(p => p.toLowerCase().includes(lowerQuery))
    );
  });
};