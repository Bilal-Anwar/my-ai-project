import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import LinkInput from './components/LinkInput';
import TranscriptionView from './components/TranscriptionView';
import ArchiveView from './components/ArchiveView';
import { SpinnerIcon, FileIcon, AlertIcon, UploadIcon, LinkIcon, ArchiveIcon } from './components/Icons';
import { analyzeMedia, fileToBase64 } from './services/geminiService';
import { saveRecord } from './services/archiveService';
import { TranscriptionStatus, FileData, AnalysisResult } from './types';

type ViewMode = 'transcribe' | 'archive';
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Urdu'];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('transcribe');
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [inputType, setInputType] = useState<'upload' | 'link'>('upload');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Dark Mode from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);

    setDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
        const next = !prev;
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        return next;
    });
  };

  const handleFileSelect = (data: FileData) => {
    setFileData(data);
    setAnalysisResult(null);
    setStatus(TranscriptionStatus.IDLE);
    setErrorMessage("");
  };

  const handleAnalyze = async () => {
    if (!fileData) return;

    setStatus(TranscriptionStatus.PROCESSING);
    setErrorMessage("");
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Stall at 90% until done
        return prev + (Math.random() * 10);
      });
    }, 800);

    try {
      const base64 = await fileToBase64(fileData.file);
      const result = await analyzeMedia(base64, fileData.mimeType, selectedLanguage);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show 100% completion
      setTimeout(() => {
          // Auto-save to archive
          saveRecord(fileData.name, result, fileData.mimeType);
          setAnalysisResult(result);
          setStatus(TranscriptionStatus.COMPLETED);
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error(error);
      setStatus(TranscriptionStatus.ERROR);
      setErrorMessage(error.message || "An unexpected error occurred during analysis.");
    }
  };

  const handleReset = () => {
    setFileData(null);
    setAnalysisResult(null);
    setStatus(TranscriptionStatus.IDLE);
    setErrorMessage("");
    setProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
              <div className="flex space-x-8 -mb-px">
                  <button
                    onClick={() => setViewMode('transcribe')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${viewMode === 'transcribe' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                     New Transcription
                  </button>
                  <button
                    onClick={() => setViewMode('archive')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${viewMode === 'archive' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                     <ArchiveIcon className="w-4 h-4 mr-2" />
                     Archive
                  </button>
              </div>
          </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {viewMode === 'archive' ? (
            <ArchiveView />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center justify-between">
                    Input Source
                    {!fileData && (
                        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                            <button 
                                onClick={() => setInputType('upload')}
                                className={`p-1.5 rounded-md transition-all ${inputType === 'upload' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                title="Upload File"
                            >
                                <UploadIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setInputType('link')}
                                className={`p-1.5 rounded-md transition-all ${inputType === 'link' ? 'bg-white dark:bg-slate-600 shadow text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                title="Paste URL"
                            >
                                <LinkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </h2>
                
                {!fileData ? (
                    inputType === 'upload' ? (
                        <FileUploader onFileSelect={handleFileSelect} disabled={status === TranscriptionStatus.PROCESSING} />
                    ) : (
                        <LinkInput onFileSelect={handleFileSelect} disabled={status === TranscriptionStatus.PROCESSING} />
                    )
                ) : (
                    <div className="space-y-4 animate-fade-in">
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex-shrink-0 p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600">
                        <FileIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{fileData.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(fileData.size / 1024 / 1024).toFixed(2)} MB • {fileData.mimeType}</p>
                        {fileData.mimeType.startsWith('audio') ? (
                            <audio controls src={fileData.previewUrl} className="w-full mt-3 h-8" />
                        ) : (
                            <div className="mt-3 text-xs text-slate-400 italic">Video preview disabled</div>
                        )}
                        </div>
                    </div>
                    
                    {/* Language Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                            Output Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            disabled={status === TranscriptionStatus.PROCESSING || status === TranscriptionStatus.COMPLETED}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    {status === TranscriptionStatus.PROCESSING ? (
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden h-10 relative">
                             <div 
                                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out flex items-center justify-center text-xs font-medium text-white shadow-inner"
                                style={{ width: `${progress}%` }}
                             >
                                 {Math.round(progress)}%
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 mix-blend-difference">
                                Processing Media...
                             </div>
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAnalyze}
                                disabled={status === TranscriptionStatus.COMPLETED}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium shadow-sm transition-all focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                    ${status === TranscriptionStatus.COMPLETED
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                `}
                            >
                                {status === TranscriptionStatus.COMPLETED ? "Analysis Complete" : "Analyze Media"}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    )}
                    
                    </div>
                )}
                </div>

                {/* Status Messages */}
                {status === TranscriptionStatus.ERROR && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
                        <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Analysis Failed</h4>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{errorMessage}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex-grow transition-colors">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">How it works</h3>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                        Upload a file or paste a direct URL.
                    </li>
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                        Select language & Click "Analyze Media".
                    </li>
                    <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                        Review, edit the transcript, and download reports.
                    </li>
                </ul>
                </div>
            </div>

            {/* Right Column: Output */}
            <div className="lg:col-span-7 h-full min-h-[500px]">
                {status === TranscriptionStatus.COMPLETED && analysisResult ? (
                    <TranscriptionView result={analysisResult} />
                ) : (
                    <div className="h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500 transition-colors">
                        {status === TranscriptionStatus.PROCESSING ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                                    <SpinnerIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Analyzing Content</h3>
                                <p className="max-w-sm mx-auto mt-2 text-slate-500 dark:text-slate-400">Gemini is analyzing audio segments, identifying speakers, and summarizing content...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">No Results Yet</h3>
                                <p className="max-w-sm mx-auto mt-2 text-sm">Upload media to see the transcription, summary, and key takeaways.</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            </div>
        )}
      </main>
    </div>
  );
};

export default App;