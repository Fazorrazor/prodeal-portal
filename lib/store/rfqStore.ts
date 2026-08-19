'use client';

import { useSyncExternalStore } from 'react';

export interface RfqItem {
  id: string;
  name: string;
  sku?: string;
  divisionSlug: 'chemicals' | 'bowls' | 'signages' | 'printing' | string;
  quantity: number;
  unit?: string;
  notes?: string;
  image_path?: string;
  metadata?: Record<string, any>;
}

interface RfqState {
  items: RfqItem[];
  isOpen: boolean;
}

const STORAGE_KEY = 'prodeal_rfq_basket_v1';

let state: RfqState = {
  items: [],
  isOpen: false,
};

// Hydrate from localStorage once in browser
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state = { ...state, items: parsed };
      }
    }
  } catch (e) {
    console.warn('Could not read RFQ store from localStorage', e);
  }
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn('Could not save RFQ store to localStorage', e);
    }
  }
}

export const rfqStore = {
  getSnapshot(): RfqState {
    return state;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  addItem(newItem: Omit<RfqItem, 'quantity'> & { quantity?: number }) {
    const qty = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
    const existingIndex = state.items.findIndex((item) => item.id === newItem.id);

    let updatedItems: RfqItem[];
    if (existingIndex > -1) {
      updatedItems = [...state.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + qty,
        unit: newItem.unit || updatedItems[existingIndex].unit,
        notes: newItem.notes || updatedItems[existingIndex].notes,
      };
    } else {
      updatedItems = [...state.items, { ...newItem, quantity: qty }];
    }

    state = {
      ...state,
      items: updatedItems,
      isOpen: true, // auto-open tray to confirm add
    };
    emit();
  },

  removeItem(id: string) {
    state = {
      ...state,
      items: state.items.filter((item) => item.id !== id),
    };
    emit();
  },

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    };
    emit();
  },

  updateNotes(id: string, notes: string) {
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === id ? { ...item, notes } : item
      ),
    };
    emit();
  },

  clear() {
    state = {
      ...state,
      items: [],
      isOpen: false,
    };
    emit();
  },

  setIsOpen(isOpen: boolean) {
    state = {
      ...state,
      isOpen,
    };
    emit();
  },

  toggleOpen() {
    state = {
      ...state,
      isOpen: !state.isOpen,
    };
    emit();
  },
};

// React Hook
export function useRfqStore() {
  const storeState = useSyncExternalStore(
    rfqStore.subscribe,
    rfqStore.getSnapshot,
    () => ({ items: [], isOpen: false }) // Server snapshot
  );

  return {
    items: storeState.items,
    itemCount: storeState.items.reduce((acc, item) => acc + item.quantity, 0),
    uniqueCount: storeState.items.length,
    isOpen: storeState.isOpen,
    addItem: rfqStore.addItem.bind(rfqStore),
    removeItem: rfqStore.removeItem.bind(rfqStore),
    updateQuantity: rfqStore.updateQuantity.bind(rfqStore),
    updateNotes: rfqStore.updateNotes.bind(rfqStore),
    clear: rfqStore.clear.bind(rfqStore),
    setIsOpen: rfqStore.setIsOpen.bind(rfqStore),
    toggleOpen: rfqStore.toggleOpen.bind(rfqStore),
  };
}
