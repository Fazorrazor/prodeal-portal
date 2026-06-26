'use client';
import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  documentId: string;
  chemicalName: string;
}

export function SDSDownloadButton({ documentId, chemicalName }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    // Simulate API delay for signed URL generation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    toast.success(`SDS generated for ${chemicalName}`);
    // Window.open(signedUrl, '_blank') would happen here
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-2 text-xs font-semibold text-brand-deep-blue/80 hover:text-brand-blue transition-colors p-2 rounded-md hover:bg-brand-blue/5"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      <span>Download SDS (PDF)</span>
      <Download className="w-3 h-3 ml-1 opacity-50" />
    </button>
  );
}
