'use client'; // needs useState for accordion toggle
import { useState } from 'react';
import { cn } from '../../../lib/utils';

const FAQS = [
  {
    question: 'What is the standard turnaround time?',
    answer: 'For standard illuminated signs, our typical turnaround is 7–10 business days after artwork approval. Large-scale installations may require 14–21 days.',
  },
  {
    question: 'Do I need to provide my own artwork?',
    answer: 'Yes, we require vector artwork (.AI, .EPS, or high-res PDF). If you only have raster images or rough sketches, our design team can recreate it for an additional fee.',
  },
  {
    question: 'What materials do you use?',
    answer: 'We use industrial-grade acrylic, aluminum composite panels (ACP), stainless steel, and high-intensity LED modules guaranteed for 50,000+ hours.',
  },
];

export function ProjectFAQ() {
  return (
    <div className="mt-20 lg:mt-28">
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
          {FAQS.length} questions
        </p>
      </div>

      <div className="flex flex-col">
        {FAQS.map((faq, i) => (
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
        className="w-full py-5 flex items-start sm:items-center justify-between gap-6 text-left focus:outline-none focus-visible:bg-black/5"
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
