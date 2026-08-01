"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Terminal,
  BrainCircuit,
  X,
  ServerCrash,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Syntax highlighting helpers
const highlightJSON = (jsonObj: any) => {
  if (!jsonObj) return "";
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  const highlighted = jsonStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let color = 'text-[#4CA6FF]'; // numbers
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = 'text-[#E50914] font-semibold'; // keys
        } else {
          color = 'text-[#27D17F]'; // strings
        }
      } else if (/true|false/.test(match)) {
        color = 'text-[#FFB020] font-bold'; // booleans
      } else if (/null/.test(match)) {
        color = 'text-[#68686F] italic'; // null
      }
      return `<span class="${color}">${match}</span>`;
    }
  );
  return highlighted;
};

const highlightStackTrace = (stack: string) => {
  if (!stack) return "";
  return stack
    // Highlight "at FunctionName (path:line)"
    .replace(/at (.*?)\s+\((.*?)\)/g, 'at <span class="text-[#FFB020] font-semibold">$1</span> (<span class="text-[#4CA6FF] underline decoration-[#4CA6FF]/30 underline-offset-4">$2</span>)')
    // Highlight "at path:line"
    .replace(/at (.*?)$/gm, (match, p1) => {
      if (match.includes('(')) return match;
      return `at <span class="text-[#4CA6FF] underline decoration-[#4CA6FF]/30 underline-offset-4">${p1}</span>`;
    })
    // Highlight "ErrorName:"
    .replace(/^([a-zA-Z0-9_]+Error):/gm, '<span class="text-[#E50914] font-bold tracking-wider">$1</span>:');
};

export function SystemLogErrorInteractive({ log }: { log: any }) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const formattedDate = format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss');

  const modalContent = expanded ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]">
      <div className="w-full h-full flex flex-col relative overflow-hidden font-mono">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#E50914] via-transparent to-transparent opacity-50" />

        <header className="p-6 border-b border-[#141416] flex justify-between items-center bg-[#070708] shrink-0">
          <div className="flex items-center gap-4">
            <ServerCrash className="w-6 h-6 text-[#E50914]" />
            <h2 className="text-[1rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5]">
              Error Inspector
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[0.65rem] text-[#68686F] tracking-[0.2em] uppercase hidden md:block animate-pulse">
              Press ESC to Exit
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              className="text-[#68686F] hover:text-[#E50914] transition-colors p-2 border border-transparent hover:border-[#E50914]/30 hover:bg-[#E50914]/10 rounded-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {/* Event Header */}
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <div className="text-[0.8rem] font-bold uppercase tracking-[0.3em] mb-4 text-[#E50914] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E50914] animate-pulse"></span>
                CONTEXT: {log.context}
              </div>
              <div className="text-2xl md:text-3xl font-bold tracking-wider text-[#F5F5F5] leading-relaxed break-words border-l-4 border-[#E50914] pl-4">
                {log.error_message}
              </div>
            </div>
            <div className="text-right text-[#68686F] text-[0.75rem] font-mono tracking-widest uppercase shrink-0">
              <div>{formattedDate}</div>
            </div>
          </div>

          {/* AI Diagnostic Panel */}
          <div className="border border-[#141416] bg-[#090909] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="p-5 border-b border-[#141416] bg-[#0D0D0F] flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-[#E50914]" />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                Automated Diagnostic
              </span>
            </div>

            <div className="p-6 md:p-8 text-[0.85rem] text-[#A7A7AA] leading-relaxed font-sans tracking-wide">
              <p>
                <strong className="text-[#F5F5F5]">Overview:</strong> The system caught an unhandled exception in the <code className="bg-[#141416] px-1.5 py-0.5 text-[#FFB020] border border-[#141416]">{log.context}</code> routine.
              </p>
              <p className="mt-4 border-l-2 border-[#141416] pl-4 italic text-[#68686F]">
                This error bypassed standard error boundaries and was written directly to the database log. Review the stack trace below for the exact line number of the failure.
              </p>
            </div>
          </div>

          {/* Raw Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-[#141416] p-6 bg-[#090909] flex flex-col max-h-[600px]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#E50914] mb-4 shrink-0 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Stack Trace
              </div>
              <pre 
                className="text-[0.75rem] text-[#A7A7AA] overflow-auto whitespace-pre-wrap leading-loose flex-1"
                dangerouslySetInnerHTML={{ __html: highlightStackTrace(log.error_stack || 'No stack trace captured.') }}
              />
            </div>

            <div className="border border-[#141416] p-6 bg-[#090909] flex flex-col max-h-[600px]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#68686F] mb-4 shrink-0 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Metadata Payload
              </div>
              <pre 
                className="text-[0.75rem] text-[#A7A7AA] overflow-auto flex-1 leading-loose"
                dangerouslySetInnerHTML={{ 
                  __html: log.metadata && Object.keys(log.metadata).length > 0 
                    ? highlightJSON(log.metadata) 
                    : '<span class="text-[#68686F] italic">No metadata payload attached.</span>' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(229,9,20,0.1)' }}
        animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
        transition={{ duration: 0.3 }}
        onClick={() => setExpanded(true)}
        className="border border-[#141416] bg-[#0D0D0F] p-4 flex flex-col gap-3 relative cursor-pointer hover:bg-[#141416] transition-colors group"
      >
        <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#E50914]" />
        <div className="flex items-center justify-between">
          <span className="text-[#E50914] font-bold uppercase tracking-[0.1em] text-[0.6rem] bg-[#310004]/30 px-2 py-0.5 border border-[#E50914]/20 group-hover:bg-[#E50914]/10 transition-colors">
            {log.context}
          </span>
          <span className="text-[#68686F] tracking-widest text-[0.65rem]">
            {formattedDate}
          </span>
        </div>
        <div className="text-[#F5F5F5] font-semibold text-[0.75rem] leading-relaxed break-words line-clamp-2">
          {log.error_message}
        </div>
      </motion.div>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
