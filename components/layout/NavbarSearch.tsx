'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ImageIcon, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { cn } from '../../lib/utils';
import { useRouter } from 'next/navigation';

import { createPortal } from 'react-dom';

interface NavbarSearchProps {
  isMobile?: boolean;
}

export function NavbarSearch({ isMobile }: NavbarSearchProps) {
  const { query, setQuery, results, isSearching, error, hasNoResults, isIdle } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut: '/' to focus search
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        e.preventDefault();
        inputRef.current?.focus();
        if (query.trim().length >= 2 || results.length > 0) setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
        return;
      }

      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          const selected = results[selectedIndex];
          setIsOpen(false);
          router.push(`/inquiry/${selected.id}?from=${selected.divisions.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router, query]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-brand-deep-blue hover:text-brand-blue transition-colors"
          aria-label="Open search"
        >
          <Search className="w-5 h-5" />
        </button>

        {mounted && isOpen && createPortal(
          <div 
            className="fixed inset-0 z-[100] bg-brand-deep-blue/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsOpen(false)}
          >
            <div 
              className="absolute top-0 left-0 right-0 bg-brand-surface shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 border-b border-brand-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-brand-border/30 flex items-center gap-4">
                <Search className="w-5 h-5 text-brand-deep-blue/80 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  autoFocus
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH..."
                  className="flex-1 bg-transparent border-none outline-none text-base font-mono font-bold tracking-widest uppercase text-brand-deep-blue placeholder:text-brand-deep-blue/80"
                />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="p-2 shrink-0 text-brand-deep-blue hover:text-brand-red transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-brand-surface">
                {isIdle && (
                  <div className="py-12 px-4 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-brand-deep-blue/80">
                      Type at least 2 characters...
                    </p>
                  </div>
                )}

                {isSearching && (
                  <div className="py-12 px-4 flex flex-col items-center justify-center">
                    <p className="text-xs font-mono font-bold tracking-widest uppercase text-brand-deep-blue animate-pulse">
                      LOADING...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="py-6 px-4 text-center border-b border-brand-red/30 bg-brand-red/5">
                    <p className="text-xs font-bold text-brand-red uppercase tracking-widest">{error}</p>
                  </div>
                )}

                {hasNoResults && (
                  <div className="py-12 px-4 text-center">
                    <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter">0 Matches</h3>
                    <p className="text-xs uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-2">
                      No products found.
                    </p>
                  </div>
                )}

                {!isSearching && !error && results.length > 0 && (
                  <ul className="flex flex-col divide-y divide-brand-border/30" role="listbox">
                    {results.map((result, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <li key={result.id} role="option" aria-selected={isSelected}>
                          <Link
                            href={`/inquiry/${result.id}?from=${result.divisions.slug}`}
                            className="flex items-center justify-between p-4 hover:bg-black/5 active:bg-black/10 transition-colors"
                            onClick={() => {
                              setIsOpen(false);
                              setQuery('');
                            }}
                          >
                            <div className="flex items-center flex-1 pr-2 gap-4">
                              <div className="w-12 h-12 shrink-0 bg-brand-surface border border-brand-border/30 relative flex items-center justify-center overflow-hidden">
                                {result.image_path ? (
                                  <Image 
                                    src={result.image_path} 
                                    alt={result.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-brand-deep-blue/80" />
                                )}
                              </div>
                              
                              <div className="flex flex-col overflow-hidden">
                                <h4 className="font-heading font-bold text-sm uppercase tracking-tight text-brand-deep-blue line-clamp-1">
                                  {result.name}
                                </h4>
                                <div className="text-[10px] font-mono font-bold text-brand-deep-blue/80 mt-1 uppercase tracking-widest truncate">
                                  <span className="mr-2 text-brand-blue/80">{result.divisions.slug.replace('-', ' ')}</span>
                                  {result.sku && <span className="mr-2">SKU: {result.sku}</span>}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-brand-deep-blue/80 shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-lg mx-auto relative z-[60]">
      <div className={cn(
        "w-full flex items-center py-1.5 px-3 transition-colors group",
        isOpen ? "border-b-2 border-brand-blue" : "border-b-2 border-brand-deep-blue/20 hover:border-brand-blue"
      )}>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) setIsOpen(true);
            else setIsOpen(false);
          }}
          onFocus={() => {
            if (query.trim().length >= 2 || results.length > 0) setIsOpen(true);
          }}
          placeholder="SEARCH"
          className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-sm font-mono font-bold tracking-widest uppercase text-brand-deep-blue placeholder:text-brand-deep-blue/80"
          aria-label="Global search"
        />
        <div className="flex items-center gap-2 shrink-0">
          {!query ? (
             <Search className={cn(
               "w-4 h-4 transition-colors",
               isOpen ? "text-brand-blue" : "text-brand-deep-blue/80 group-hover:text-brand-blue"
             )} />
          ) : (
            <button 
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-brand-deep-blue/80 hover:text-brand-red transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border/40 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col max-h-[60vh]">
          <div className="flex-1 overflow-y-auto bg-brand-surface">
            {isIdle && (
              <div className="py-8 px-4 text-center bg-transparent">
                <p className="text-[10px] font-bold tracking-widest uppercase text-brand-deep-blue/80">
                  Type at least 2 characters...
                </p>
              </div>
            )}

            {isSearching && (
              <div className="py-8 px-4 flex flex-col items-center justify-center bg-transparent">
                <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-brand-deep-blue animate-pulse">
                  LOADING...
                </p>
              </div>
            )}

            {error && (
              <div className="py-6 px-4 text-center border-t border-brand-red/30 bg-brand-red/5">
                <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{error}</p>
              </div>
            )}

            {hasNoResults && (
              <div className="py-8 px-4 text-center bg-transparent">
                <h3 className="font-heading font-bold text-lg text-brand-deep-blue uppercase tracking-tighter">0 Matches</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-1">
                  No products found.
                </p>
              </div>
            )}

            {!isSearching && !error && results.length > 0 && (
              <ul className="flex flex-col divide-y divide-brand-border/30 bg-transparent" role="listbox">
                {results.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={result.id} role="option" aria-selected={isSelected}>
                      <Link
                        href={`/inquiry/${result.id}?from=${result.divisions.slug}`}
                        className={cn(
                          "flex items-center justify-between p-3 group transition-colors",
                          isSelected ? "bg-black/5" : "hover:bg-black/5"
                        )}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center flex-1 pr-2 gap-3">
                          <div className="w-10 h-10 shrink-0 bg-brand-surface border border-brand-border/30 relative flex items-center justify-center overflow-hidden">
                            {result.image_path ? (
                              <Image 
                                src={result.image_path} 
                                alt={result.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-brand-deep-blue/80" />
                            )}
                          </div>
                          
                          <div className="flex flex-col overflow-hidden">
                            <h4 className={cn(
                              "font-heading font-bold text-xs uppercase tracking-tight transition-colors line-clamp-1",
                              isSelected ? "text-brand-blue" : "text-brand-deep-blue group-hover:text-brand-blue"
                            )}>
                              {result.name}
                            </h4>
                            <div className="text-[8px] font-mono font-bold text-brand-deep-blue/80 mt-0.5 uppercase tracking-widest truncate">
                              <span className="mr-2 text-brand-blue/80">{result.divisions.slug.replace('-', ' ')}</span>
                              {result.sku && <span className="mr-2">SKU: {result.sku}</span>}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-all shrink-0",
                          isSelected ? "text-brand-blue translate-x-1" : "text-brand-deep-blue/80 group-hover:text-brand-blue group-hover:translate-x-1"
                        )} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
