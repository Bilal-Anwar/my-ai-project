import React, { useCallback, useState } from 'react';
import { UploadIcon, FileIcon } from './Icons';
import { FileData } from '../types';

interface FileUploaderProps {
  onFileSelect: (fileData: FileData) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    // Basic validation
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setError("Please upload a valid audio or video file.");
      return;
    }
    
    // Size warning (soft limit for browser performance)
    const MAX_SIZE_MB = 20;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
       setError(`File is too large for browser-based processing (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use files under ${MAX_SIZE_MB}MB for this demo.`);
       return;
    }

    const objectUrl = URL.createObjectURL(file);
    onFileSelect({
      file,
      name: file.name,
      size: file.size,
      previewUrl: objectUrl,
      mimeType: file.type
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
          ${disabled ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60' : 
            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.99]' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="audio/*,video/*"
          onChange={handleInputChange}
          disabled={disabled}
        />
        
        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-200 dark:bg-blue-800' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
           <UploadIcon className={`w-8 h-8 ${isDragging ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'}`} />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
          {isDragging ? 'Drop file here' : 'Upload Audio or Video'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Drag and drop your file here, or click to browse. 
          <br/>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">Supports MP3, WAV, MP4, MPEG, etc. (Max 20MB)</span>
        </p>

        {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800 flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
        )}
      </div>

      <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1 flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            YouTube Link Note
        </h4>
        <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
            Please use direct file links (e.g. .mp4). YouTube links are not supported in this client-side demo due to browser security restrictions.
        </p>
      </div>
    </div>
  );
};

export default FileUploader;