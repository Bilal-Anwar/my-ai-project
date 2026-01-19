import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import TranscriptionView from './components/TranscriptionView';
import ArchiveView from './components/ArchiveView';
import { Auth } from './components/Auth'; // Make sure this path is correct
import { SpinnerIcon, FileIcon, ArchiveIcon, UploadIcon, AlertIcon } from './components/Icons';
import { analyzeMedia, fileToBase64 } from './services/geminiService';
import { saveRecord } from './services/archiveService';
import { TranscriptionStatus, FileData, AnalysisResult } from './types';

const LANGUAGES = ['English', 'Urdu', 'Hindi', 'Spanish', 'French', 'German'];

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'transcribe' | 'archive'>('transcribe');
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAnalyze = async () => {
    if (!fileData) return;
    setStatus(TranscriptionStatus.PROCESSING);
    setProgress(10);
    try {
      const base64 = await fileToBase64(fileData.file);
      setProgress(40);
      const result = await analyzeMedia(base64, fileData.mimeType, selectedLanguage);
      setProgress(90);
      saveRecord(fileData.name, result, fileData.mimeType);
      setAnalysisResult(result);
      setStatus(TranscriptionStatus.COMPLETED);
      setProgress(100);
    } catch (error) {
      setStatus(TranscriptionStatus.ERROR);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><SpinnerIcon className="animate-spin w-8 h-8" /></div>;
  if (!user) return <Auth onLogin={() => {}} />;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} onLogout={() => signOut(auth)} />
      
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 flex space-x-8">
              <button onClick={() => setViewMode('transcribe')} className={`pb-4 px-1 border-b-2 font-medium text-sm ${viewMode === 'transcribe' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}>New Transcription</button>
              <button onClick={() => setViewMode('archive')} className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${viewMode === 'archive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}><ArchiveIcon className="w-4 h-4 mr-2" /> Archive</button>
          </div>
      </div>

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'archive' ? <ArchiveView /> : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold mb-4">Input Source</h2>
                    {!fileData ? (
                        <FileUploader onFileSelect={(data) => setFileData(data)} disabled={status === TranscriptionStatus.PROCESSING} />
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-4 border border-slate-200 dark:border-slate-600">
                                <FileIcon className="w-8 h-8 text-blue-500" />
                                <div className="truncate"><p className="text-sm font-semibold truncate">{fileData.name}</p></div>
                            </div>
                            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <button onClick={handleAnalyze} disabled={status === TranscriptionStatus.PROCESSING} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-all">
                                {status === TranscriptionStatus.PROCESSING ? `Analyzing (${progress}%)` : 'Analyze Media'}
                            </button>
                            <button onClick={() => setFileData(null)} className="w-full text-xs text-slate-400">Clear File</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] p-6">
                    {status === TranscriptionStatus.COMPLETED && analysisResult ? (
                        <TranscriptionView result={analysisResult} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            {status === TranscriptionStatus.PROCESSING ? <SpinnerIcon className="w-10 h-10 animate-spin text-blue-500" /> : <p>Results will appear here after analysis</p>}
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default App;