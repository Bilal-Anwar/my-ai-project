import React, { useState } from 'react';
import { LinkIcon, SpinnerIcon } from './Icons';
import { FileData } from '../types';
import { fetchMediaFromUrl } from '../services/geminiService';

interface LinkInputProps {
  onFileSelect: (fileData: FileData) => void;
  disabled?: boolean;
}

const LinkInput: React.FC<LinkInputProps> = ({ onFileSelect, disabled }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Basic YouTube check to warn user
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setError("YouTube links cannot be fetched directly by the browser due to YouTube's security policies. Please use a direct link to a video/audio file (e.g., ending in .mp4, .mp3).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { blob, mimeType } = await fetchMediaFromUrl(url);
      
      const fileName = url.split('/').pop() || 'media_from_link';
      
      onFileSelect({
        file: blob,
        name: fileName,
        size: blob.size,
        mimeType: mimeType,
        previewUrl: url // Use original URL for preview
      });
      setUrl('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch media from URL.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
       <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
          
          <div className="flex flex-col items-center justify-center text-center mb-6">
             <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                <LinkIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
             </div>
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Paste URL</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
               Enter a direct link to an audio or video file.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
             <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                disabled={disabled || isLoading}
             />
             <button 
                type="submit"
                disabled={disabled || isLoading || !url.trim()}
                className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 text-sm font-medium transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600"
             >
                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'Fetch'}
             </button>
          </form>

          {error && (
            <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800 flex items-start text-left">
                <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
        )}
       </div>

       <div className="mt-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
             <strong>Note:</strong> The link must be a direct download link (e.g., .mp4, .mp3, .wav) and the server must allow Cross-Origin Resource Sharing (CORS). YouTube, Vimeo, and other streaming platforms are not supported in this client-side demo.
          </p>
       </div>
    </div>
  );
};

export default LinkInput;