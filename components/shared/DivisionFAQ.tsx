'use client'; // needs useState for accordion toggle
import { useState } from 'react';
import { cn } from '../../lib/utils';

export interface FAQ {
  question: string;
  answer: string;
}

export function DivisionFAQ({ faqs }: { faqs: FAQ[] }) {
  if (!faqs || faqs.length === 0) return null;

  // Generate the JSON-LD FAQPage schema string
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mt-20 lg:mt-28">
      {/* Invisible JSON-LD Schema for AI/SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-0">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Common Questions
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            FAQ
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          {faqs.length} questions
        </p>
      </div>

      <div className="flex flex-col">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-border/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 pr-4 sm:pr-8 flex items-start sm:items-center justify-between gap-6 text-left focus:outline-none focus-visible:bg-black/5"
        aria-expanded={isOpen}
      >
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold text-brand-deep-blue/80 tracking-widest shrink-0 hidden sm:block mt-0.5 sm:mt-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-heading font-bold text-base sm:text-lg text-brand-deep-blue uppercase tracking-tight leading-snug">
            {question}
          </span>
        </div>
        <span className={cn(
          'text-brand-deep-blue font-mono font-bold text-xl shrink-0 transition-transform duration-200 leading-none',
          isOpen && 'rotate-45'
        )}>
          +
        </span>
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isOpen ? 'max-h-60 pb-5' : 'max-h-0'
      )}>
        <p className="text-sm text-brand-deep-blue/80 font-body leading-relaxed sm:pl-[calc(1rem+1.5rem)]">
          {answer}
        </p>
      </div>
    </div>
  );
}
