
import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { QAItem } from '../types';

interface FileUploadProps {
  onUploadSuccess: (items: QAItem[]) => void;
  onUploadError: (msg: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Basic Validation
        if (!json || typeof json !== 'object') {
          throw new Error('File content is not a valid JSON object.');
        }

        // Support both { items: [...] } format or just direct array [...]
        const items = Array.isArray(json) ? json : json.items;

        if (!Array.isArray(items)) {
          throw new Error('JSON must contain an "items" array or be an array itself.');
        }

        // Validate Item Structure
        const isValidStructure = items.every((item: any) => 
          item && 
          (typeof item.id === 'string' || typeof item.id === 'number') &&
          typeof item.question === 'string' &&
          typeof item.answer === 'string'
        );

        if (!isValidStructure) {
          throw new Error('Some items are missing required fields (id, question, answer).');
        }

        onUploadSuccess(items);
      } catch (err) {
        onUploadError(err instanceof Error ? err.message : 'Failed to parse JSON file.');
      }
    };

    reader.onerror = () => {
      onUploadError('Error reading the file.');
    };

    reader.readAsText(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const template = {
      items: [
        {
          id: "sample-1",
          question: "Example Question: How do I format my JSON?",
          answer: "Your JSON file should have a root object with an 'items' array. Each item needs an 'id', 'question', and 'answer'."
        },
        {
          id: "sample-2",
          question: "Can I include multiple paragraphs?",
          answer: "Yes, regular text strings are supported. The card will expand to fit the content automatically."
        },
        {
          id: "sample-3",
          question: "Tell me about a time you solved a problem.",
          answer: "Add your answer here. The board automatically extracts keywords from your questions to help you filter them."
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qa_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownloadTemplate}
        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
        title="Download example JSON file"
      >
        <Download size={16} />
        <span>Template</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-label="Upload JSON file"
      />
      <button
        onClick={triggerUpload}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <Upload size={16} />
        <span>Upload JSON</span>
      </button>
    </div>
  );
};
