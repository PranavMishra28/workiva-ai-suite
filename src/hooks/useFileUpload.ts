import { useState, useCallback } from 'react';

export interface FileUpload {
  id: string;
  file: File;
  type: 'image' | 'pdf' | 'other';
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface UseFileUploadProps {
  onUploadComplete: (upload: FileUpload) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useFileUpload({
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf'],
}: UseFileUploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`;
      }

      // Check file type
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category);
        }
        return file.type === type;
      });

      if (!isValidType) {
        return 'File type not supported. Please upload images (JPG, PNG, GIF, WebP) or PDFs.';
      }

      return null;
    },
    [maxFileSize, allowedTypes]
  );

  const createPreview = useCallback(
    (file: File): Promise<string | undefined> =>
      new Promise(resolve => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(undefined);
        }
      }),
    []
  );

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file
      const error = validateFile(file);
      if (error) {
        return { error };
      }

      // Create upload object
      const uploadId = crypto.randomUUID();
      const upload: FileUpload = {
        id: uploadId,
        file,
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type === 'application/pdf'
            ? 'pdf'
            : 'other',
        progress: 0,
        status: 'uploading',
      };

      // Add to uploads list
      setUploads(prev => [...prev, upload]);

      try {
        // Create preview for images
        if (upload.type === 'image') {
          const preview = await createPreview(file);
          if (preview) {
            upload.preview = preview;
          }
        }

        // Simulate upload progress
        const simulateProgress = () =>
          new Promise<void>(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                resolve();
              }
              setUploads(prev =>
                prev.map(u => (u.id === uploadId ? { ...u, progress } : u))
              );
            }, 100);
          });

        // For small files, show instant progress
        if (file.size <= 100 * 1024) {
          // 100KB
          upload.progress = 100;
          upload.status = 'success';
          setUploads(prev =>
            prev.map(u =>
              u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u
            )
          );
        } else {
          await simulateProgress();
          upload.status = 'success';
          setUploads(prev =>
            prev.map(u => (u.id === uploadId ? { ...u, status: 'success' } : u))
          );
        }

        // Call completion callback
        onUploadComplete(upload);
        return { success: true, upload };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setUploads(prev =>
          prev.map(u =>
            u.id === uploadId
              ? { ...u, status: 'error', error: errorMessage }
              : u
          )
        );
        return { error: upload.error };
      }
    },
    [validateFile, createPreview, onUploadComplete]
  );

  const removeUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    uploadFile,
    removeUpload,
    clearUploads,
  };
}
