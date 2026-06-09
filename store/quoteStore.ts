import { create } from 'zustand';
import { z } from 'zod';
import { ContactDetailsSchema } from '../lib/validators/inquiry';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export type DivisionSlug = 'signages' | 'printing' | 'bowls' | 'chemicals';
export type ContactDetailsType = z.infer<typeof ContactDetailsSchema>;

interface QuoteState {
  isOpen: boolean;
  division: DivisionSlug | null;
  currentStep: 1 | 2 | 3 | 4;
  contactDetails: ContactDetailsType | null;
  inquiryDetails: Record<string, unknown> | null;
  uploadedFiles: UploadedFile[];
  trackingId: string | null;
  isSubmitting: boolean;
  submitError: string | null;

  chemicalSearch: {
    searchTerm: string;
  };

  // Actions
  openBuilder: (division: DivisionSlug | null) => void;
  closeBuilder: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setContactDetails: (data: ContactDetailsType) => void;
  setInquiryDetails: (data: Record<string, unknown>) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (fileUrl: string) => void;
  setTrackingId: (id: string) => void;
  setSearchTerm: (term: string) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  division: null,
  currentStep: 1 as const,
  contactDetails: null,
  inquiryDetails: null,
  uploadedFiles: [],
  trackingId: null,
  isSubmitting: false,
  submitError: null,
  chemicalSearch: {
    searchTerm: '',
  },
};

export const useQuoteStore = create<QuoteState>((set) => ({
  ...initialState,

  openBuilder: (division) => set({ isOpen: true, division, currentStep: 1 }),
  closeBuilder: () => set({ isOpen: false }),
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 4) as 1 | 2 | 3 | 4 
  })),
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) as 1 | 2 | 3 | 4 
  })),
  setContactDetails: (data) => set({ contactDetails: data }),
  setInquiryDetails: (data) => set({ inquiryDetails: data }),
  addFile: (file) => set((state) => ({ 
    uploadedFiles: [...state.uploadedFiles, file] 
  })),
  removeFile: (fileUrl) => set((state) => ({ 
    uploadedFiles: state.uploadedFiles.filter((f) => f.url !== fileUrl) 
  })),
  setTrackingId: (id) => set({ trackingId: id }),
  setSearchTerm: (term) => set((state) => ({
    chemicalSearch: { searchTerm: term }
  })),
  reset: () => set(initialState),
}));
