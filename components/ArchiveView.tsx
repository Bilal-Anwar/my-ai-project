import React, { useState, useEffect } from 'react';
import { ArchiveRecord, Folder } from '../types';
import { getRecords, getFolders, searchRecords, deleteRecord, createFolder, moveRecord } from '../services/archiveService';
import { FolderIcon, SearchIcon, FileIcon, ArchiveIcon } from './Icons';
import TranscriptionView from './TranscriptionView';

interface ArchiveViewProps {
  // no props needed
}

const ArchiveView: React.FC<ArchiveViewProps> = () => {
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const refreshData = () => {
    setRecords(getRecords());
    setFolders(getFolders());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setRecords(searchRecords(query));
      setSelectedFolderId('all');
    } else {
      setRecords(getRecords());
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      refreshData();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this record?')) {
      deleteRecord(id);
      refreshData();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const handleMove = (recordId: string, folderId: string) => {
      moveRecord(recordId, folderId);
      refreshData();
  }

  const filteredRecords = selectedFolderId === 'all' 
    ? records 
    : records.filter(r => r.folderId === selectedFolderId);

  // Detail View
  if (selectedRecord) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="flex items-center mb-4">
            <button 
            onClick={() => setSelectedRecord(null)}
            className="group flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
            <div className="p-1 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 mr-2 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            Back to Library
            </button>
        </div>
        <div className="flex-grow shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
           <TranscriptionView 
             result={selectedRecord.result} 
             title={selectedRecord.title} 
             date={selectedRecord.date} 
           />
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex h-full min-h-[600px] gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col">
        <div className="px-3 mb-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Library</h3>
        </div>
        
        <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <button
            onClick={() => { setSelectedFolderId('all'); setSearchQuery(''); setRecords(getRecords()); }}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                selectedFolderId === 'all' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArchiveIcon className={`w-4 h-4 mr-3 ${selectedFolderId === 'all' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} />
            All Archives
            <span className={`ml-auto text-xs ${selectedFolderId === 'all' ? 'text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                {records.length}
            </span>
          </button>

          <div className="mt-6 px-3 mb-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Folders</h3>
          </div>

          {folders.map(folder => {
             const count = records.filter(r => r.folderId === folder.id).length;
             return (
                <button
                key={folder.id}
                onClick={() => { setSelectedFolderId(folder.id); setSearchQuery(''); setRecords(getRecords()); }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    selectedFolderId === folder.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                >
                <FolderIcon className={`w-4 h-4 mr-3 ${selectedFolderId === folder.id ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} />
                <span className="truncate">{folder.name}</span>
                <span className={`ml-auto text-xs ${selectedFolderId === folder.id ? 'text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                    {count}
                </span>
                </button>
            );
          })}
        </nav>

        {/* Create Folder Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
            {!isCreatingFolder ? (
                <button 
                    onClick={() => setIsCreatingFolder(true)}
                    className="w-full flex items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 dashed"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Folder
                </button>
            ) : (
                <form onSubmit={handleCreateFolder} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Folder Name</label>
                    <input 
                        type="text" 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="e.g., Podcasts"
                        autoFocus
                        className="w-full text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none mb-3 transition-shadow"
                    />
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            onClick={() => setIsCreatingFolder(false)} 
                            className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!newFolderName.trim()}
                            className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create
                        </button>
                    </div>
                </form>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
           <div className="relative flex-grow max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                  type="text" 
                  placeholder="Search transcripts, summaries..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
           </div>
           <div className="ml-4 text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'Record' : 'Records'}
           </div>
        </div>

        {/* Record List */}
        <div className="flex-grow overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 custom-scrollbar">
             {filteredRecords.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <SearchIcon className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No records found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or select a different folder.</p>
                 </div>
             ) : (
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {filteredRecords.map(record => (
                         <div 
                            key={record.id} 
                            className="group p-5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500 bg-white dark:bg-slate-800"
                            onClick={() => setSelectedRecord(record)}
                         >
                            <div className="flex justify-between items-start gap-4">
                                {/* Icon & Content */}
                                <div className="flex items-start gap-4 flex-grow min-w-0">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 group-hover:scale-105 transition-transform">
                                        <FileIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate mb-1">
                                            {record.title}
                                        </h4>
                                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2 space-x-2">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                                                {record.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 pr-4">
                                            {record.result.summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions (Visible on Hover/Focus) */}
                                <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <select 
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleMove(record.id, e.target.value)}
                                        value={record.folderId}
                                        className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300 hover:border-blue-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer w-24"
                                        title="Move to folder"
                                    >
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                    <button 
                                        onClick={(e) => handleDelete(record.id, e)}
                                        className="flex items-center text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors"
                                        title="Delete record"
                                    >
                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;