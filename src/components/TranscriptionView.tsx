import React, { useState, useEffect } from 'react';
import { DownloadIcon, CopyIcon, CheckIcon, SummaryIcon, ListIcon, TextIcon, ClockIcon, UserIcon } from './Icons';
import { AnalysisResult, Segment } from '../types';
import { jsPDF } from 'jspdf';

interface TranscriptionViewProps {
  result: AnalysisResult;
  title?: string;
  date?: string;
}

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ result, title = 'Transcription Result', date }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [copied, setCopied] = useState(false);
  const [editableSegments, setEditableSegments] = useState<Segment[]>(result.segments || []);

  useEffect(() => {
    setEditableSegments(result.segments || []);
  }, [result]);

  const handleSegmentChange = (index: number, newText: string) => {
    const updated = [...editableSegments];
    updated[index].text = newText;
    setEditableSegments(updated);
  };

  const getFullTranscriptText = () => {
    if (editableSegments.length > 0) {
        return editableSegments.map(s => `${s.speaker} [${s.startTime}]: ${s.text}`).join('\n\n');
    }
    return result.transcription;
  }

  const handleCopy = async () => {
    const textToCopy = activeTab === 'summary' 
        ? `Summary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.join('\n- ')}` 
        : getFullTranscriptText();
        
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadTxt = () => {
    const content = `TITLE: ${title}\nDATE: ${date || new Date().toISOString()}\n\nSUMMARY\n=======\n${result.summary}\n\nKEY POINTS\n==========\n${result.keyPoints.map(p => `- ${p}`).join('\n')}\n\nTRANSCRIPTION\n=============\n${getFullTranscriptText()}`;
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}_transcription.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    let y = 20;

    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Executive Summary", margin, y);
    y += 8;

    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(result.summary, maxLineWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 7 + 10;

    doc.setFontSize(14);
    doc.text("Key Points", margin, y);
    y += 8;
    
    doc.setFontSize(11);
    result.keyPoints.forEach(point => {
        const pointLines = doc.splitTextToSize(`• ${point}`, maxLineWidth);
        doc.text(pointLines, margin, y);
        y += pointLines.length * 7;
    });
    y += 10;

    doc.setFontSize(14);
    doc.text("Full Transcription", margin, y);
    y += 8;

    doc.setFontSize(10);
    // Basic pagination loop for segments using editable segments
    editableSegments.forEach(segment => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${segment.speaker} [${segment.startTime}-${segment.endTime}]`, margin, y);
        y += 5;
        
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(segment.text, maxLineWidth);
        
        if (y + (textLines.length * 5) > 280) {
             doc.addPage();
             y = 20;
        }
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 5;
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadWord = () => {
    // Creating a simple HTML-based Word compatible file
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body style="font-family: Calibri, sans-serif;">
        <h1>${title}</h1>
        <p style="color: #666; font-size: 0.9em;">${date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
        
        <h2>Executive Summary</h2>
        <p>${result.summary}</p>
        
        <h2>Key Points</h2>
        <ul>
          ${result.keyPoints.map(p => `<li>${p}</li>`).join('')}
        </ul>
        
        <h2>Transcription</h2>
        ${editableSegments.map(s => `
            <p><strong>${s.speaker}</strong> <span style="color:#888; font-size:0.8em;">[${s.startTime} - ${s.endTime}]</span><br/>
            ${s.text}</p>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full animate-fade-in transition-colors">
      
      {/* Header with Tabs */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 pt-3 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex space-x-1 bg-slate-200/50 dark:bg-slate-700 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex items-center space-x-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'summary' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                    }`}
                >
                    <SummaryIcon className="w-4 h-4" />
                    <span>Summary & Points</span>
                </button>
                <button
                    onClick={() => setActiveTab('transcript')}
                    className={`flex items-center space-x-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'transcript' 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                    }`}
                >
                    <TextIcon className="w-4 h-4" />
                    <span>Transcript</span>
                </button>
            </div>

            <div className="flex space-x-2 pb-2 sm:pb-0">
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-800 transition-colors"
                    title="Copy Text"
                >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />}
                </button>
                
                <div className="flex bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg overflow-hidden">
                    <button
                        onClick={handleDownloadTxt}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600 border-r border-blue-200 dark:border-slate-600"
                    >
                        TXT
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600 border-r border-blue-200 dark:border-slate-600"
                    >
                        PDF
                    </button>
                    <button
                        onClick={handleDownloadWord}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600"
                    >
                        Word
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-grow min-h-[400px] overflow-hidden bg-white dark:bg-slate-800 transition-colors">
        {activeTab === 'summary' ? (
            <div className="h-full overflow-y-auto p-6 space-y-8 animate-fade-in custom-scrollbar">
                <section>
                    <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                        <SummaryIcon className="w-4 h-4 mr-2" />
                        Executive Summary
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base border-l-4 border-blue-500 pl-4 bg-slate-50 dark:bg-slate-700/30 py-2 pr-2 rounded-r-lg">
                        {result.summary}
                    </p>
                </section>
                
                <section>
                    <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                        <ListIcon className="w-4 h-4 mr-2" />
                        Key Points
                    </h4>
                    <ul className="space-y-3">
                        {result.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start text-slate-700 dark:text-slate-300 text-sm leading-6">
                                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        ) : (
            <div className="h-full overflow-y-auto p-6 animate-fade-in space-y-6 custom-scrollbar">
                {editableSegments.length > 0 ? (
                    editableSegments.map((segment, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:space-x-4">
                            <div className="flex-shrink-0 w-32 mb-1 sm:mb-0">
                                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 rounded px-2 py-1 inline-block">
                                    <ClockIcon className="w-3 h-3" />
                                    <span>{segment.startTime}</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-1 text-xs font-bold text-blue-700 dark:text-blue-400">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{segment.speaker}</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <textarea
                                    value={segment.text}
                                    onChange={(e) => handleSegmentChange(index, e.target.value)}
                                    className="w-full text-slate-700 dark:text-slate-200 leading-relaxed text-sm bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded p-2 transition-all resize-none overflow-hidden h-auto"
                                    rows={Math.ceil(segment.text.length / 80)}
                                    style={{ minHeight: '60px' }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <textarea
                        readOnly
                        className="w-full h-full p-0 text-slate-700 dark:text-slate-200 leading-relaxed resize-none focus:outline-none font-mono text-sm bg-transparent border-none"
                        value={result.transcription}
                    />
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionView;