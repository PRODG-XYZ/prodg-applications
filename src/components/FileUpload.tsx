'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (url: string, fileName: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  currentFileName?: string;
  onRemove?: () => void;
}

export default function FileUpload({
  onFileUpload,
  accept = '.pdf,.doc,.docx',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  currentFileName,
  onRemove,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only PDF and DOC files are allowed.';
    }
    
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`;
    }
    
    return null;
  }, [maxSize]);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        onFileUpload(result.url, result.fileName);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    await uploadFile(file);
  }, [uploadFile, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      await handleFileSelect(files[0]);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  }, [handleFileSelect, disabled]);

  if (currentFileName) {
    return (
      <div className={`border border-green-400/20 bg-green-500/10 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-400">File uploaded successfully</p>
              <p className="text-xs text-slate-400">{currentFileName}</p>
            </div>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-600 hover:border-slate-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('resume-file-input')?.click()}
      >
        <input
          id="resume-file-input"
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-sm text-slate-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-slate-700/50 p-4">
              {dragActive ? (
                <Upload className="w-8 h-8 text-cyan-400" />
              ) : (
                <FileText className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">
                {dragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-xs text-slate-500">
                Drag and drop or click to browse • PDF, DOC, DOCX • Max {maxSize / (1024 * 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
} 