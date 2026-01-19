export interface Segment {
  startTime: string;
  endTime: string;
  speaker: string;
  text: string;
}

export interface AnalysisResult {
  transcription: string;
  summary: string;
  keyPoints: string[];
  segments: Segment[];
}

export interface FileData {
  file: File | Blob;
  name: string;
  size: number;
  previewUrl?: string;
  base64?: string;
  mimeType: string;
}

export enum TranscriptionStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ArchiveRecord {
  id: string;
  title: string;
  date: string; // ISO string
  folderId: string;
  result: AnalysisResult;
  mimeType: string;
}

export interface Folder {
  id: string;
  name: string;
}