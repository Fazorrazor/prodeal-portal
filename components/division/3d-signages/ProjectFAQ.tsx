'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ProjectFAQ() {
  const faqs = [
    {
      question: 'What is the standard turnaround time?',
      answer: 'For standard illuminated signs, our typical turnaround is 7-10 business days after artwork approval. Large-scale installations may require 14-21 days.'
    },
    {
      question: 'Do I need to provide my own artwork?',
      answer: 'Yes, we require vector artwork (.AI, .EPS, or high-res PDF). If you only have raster images or rough sketches, our design team can recreate it for an additional fee.'
    },
    {
      question: 'What materials do you use?',
      answer: 'We use industrial-grade acrylic, aluminum composite panels (ACP), stainless steel, and high-intensity LED modules guaranteed for 50,000+ hours.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-24">
      <h2 className="font-heading font-bold text-3xl text-brand-deep-blue mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-brand-border/60 rounded-lg overflow-hidden bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:bg-brand-surface"
      >
        <span className="font-heading font-semibold text-lg text-brand-deep-blue">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-brand-blue transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <div className={cn("px-6 overflow-hidden transition-all duration-300", isOpen ? "max-h-40 pb-4" : "max-h-0")}>
        <p className="text-brand-deep-blue/70 font-body mt-2">{answer}</p>
      </div>
    </div>
  );
}
