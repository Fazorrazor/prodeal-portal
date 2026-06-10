'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File as FileIcon, Image as ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UploadedFile } from '../../store/quoteStore'; // We can keep using the type

interface FileUploadZoneProps {
  uploadedFiles: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (url: string) => void;
  divisionSlug: string;
}

export function FileUploadZone({ uploadedFiles, onAddFile, onRemoveFile, divisionSlug }: FileUploadZoneProps) {
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    setIsUploading(true);
    setUploadProgress(10); // initial visual progress
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('divisionSlug', divisionSlug);

      // We'll fake progress by animating it until the fetch resolves, 
      // since fetch doesn't natively support upload progress.
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Add to Zustand store
      const newFile: UploadedFile = {
        name: result.name,
        url: result.path,
        size: result.size,
        mimeType: result.mimeType,
      };
      
      onAddFile(newFile);
      toast.success('File uploaded successfully');
      
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during upload');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [onAddFile, divisionSlug]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/svg+xml': [],
      'application/pdf': [],
      'application/illustrator': [],
      'application/postscript': [],
    },
    multiple: false,
    disabled: isUploading || uploadedFiles.length >= 3 // Let's cap at 3 for safety
  });

  return (
    <div className="w-full mt-10">
      <h3 className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-6 border-b-2 border-brand-border/60 pb-2">
        Attachments (Optional)
      </h3>
      
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col mb-6">
          {uploadedFiles.map((file) => (
            <div key={file.url} className="flex items-center justify-between py-4 border-b border-brand-border/60 group">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex-shrink-0">
                  {file.mimeType.startsWith('image/') ? (
                    <ImageIcon className="w-6 h-6 text-brand-blue" />
                  ) : (
                    <FileIcon className="w-6 h-6 text-brand-red" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-deep-blue truncate">{file.name}</p>
                  <p className="text-[10px] font-mono font-bold text-brand-deep-blue/40 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(file.url)}
                className="p-3 text-brand-deep-blue/40 hover:text-brand-surface hover:bg-brand-red border border-transparent hover:border-brand-red transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length < 3 && (
        <div 
          {...getRootProps()} 
          className={`
            relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-border/80 bg-black/5 hover:border-brand-blue hover:bg-brand-blue/5'}
            ${isUploading ? 'pointer-events-none opacity-80' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center w-full max-w-xs mx-auto">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue">Transmitting Data...</p>
              <div className="w-full h-1 bg-brand-border/60 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-brand-blue transition-all duration-200 ease-out" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-brand-deep-blue/40 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-brand-deep-blue text-center mb-2">
                <span className="text-brand-blue">Tap to select</span>
                <span className="hidden sm:inline"> or drop files</span>
              </p>
              <p className="text-[10px] font-mono font-bold text-brand-deep-blue/40 text-center uppercase tracking-widest px-4">
                PDF / JPG / PNG (MAX 10MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
