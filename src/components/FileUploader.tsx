import React, { useRef, useCallback } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { FileUpload } from '../hooks/useFileUpload';

interface FileUploaderProps {
  uploads: FileUpload[];
  onFileSelect: (files: FileList) => void;
  onRemoveUpload: (uploadId: string) => void;
  onOpenPdf?: (file: File) => void;
}

export function FileUploader({
  uploads,
  onFileSelect,
  onRemoveUpload,
  onOpenPdf,
}: FileUploaderProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (files && files.length > 0) {
        onFileSelect(files);
      }
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    },
    [onFileSelect]
  );

  const handlePdfClick = useCallback(
    (file: File) => {
      if (onOpenPdf) {
        onOpenPdf(file);
      } else {
        // Default behavior: open in new tab
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      }
    },
    [onOpenPdf]
  );

  if (uploads.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      {uploads.map(upload => (
        <div
          key={upload.id}
          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {/* File Icon/Preview */}
          <div className="flex-shrink-0">
            {upload.type === 'image' && upload.preview ? (
              <img
                src={upload.preview}
                alt={upload.file.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : upload.type === 'pdf' ? (
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {upload.status === 'uploading' && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {upload.progress}%
                    </span>
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-xs">{upload.error}</span>
                  </div>
                )}

                {upload.status === 'success' && (
                  <div className="flex items-center space-x-2">
                    {upload.type === 'pdf' && (
                      <button
                        type="button"
                        onClick={() => handlePdfClick(upload.file)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        Open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveUpload(upload.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Remove file"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {upload.status === 'uploading' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf"
        multiple
      />
    </div>
  );
}
