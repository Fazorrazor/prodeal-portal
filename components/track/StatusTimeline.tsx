import { CheckCircle2, Circle, Clock, PackageCheck, FileText } from 'lucide-react';

interface Props {
  currentStatus: string; // 'new' | 'processing' | 'quoted' | 'completed'
}

export function StatusTimeline({ currentStatus }: Props) {
  const steps = [
    { id: 'new', label: 'Received', icon: Clock },
    { id: 'in_progress', label: 'In Progress', icon: Circle },
    { id: 'quoted', label: 'Quote Ready', icon: FileText },
    { id: 'closed', label: 'Closed', icon: PackageCheck },
  ];

  const safeStatus = currentStatus?.toLowerCase() || 'new';
  const foundIndex = steps.findIndex(s => s.id === safeStatus);
  const currentIndex = foundIndex === -1 ? 0 : foundIndex;

  return (
    <div className="relative">
      {/* Lines Container to prevent bleed */}
      <div className="absolute top-6 left-6 right-6 h-1 hidden sm:block">
        {/* Background Line */}
        <div className="absolute inset-0 bg-brand-border/40" />
        
        {/* Active Line */}
        <div 
          className="absolute inset-y-0 left-0 bg-brand-blue transition-all duration-1000" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = isCompleted && !isCurrent ? CheckCircle2 : step.icon;
          
          return (
            <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 group">
              <div 
                className={`w-12 h-12 flex items-center justify-center border-4 transition-colors duration-500
                  ${isCompleted 
                    ? 'bg-brand-blue border-brand-blue text-white' 
                    : 'bg-brand-surface border-brand-border/60 text-brand-deep-blue/40'
                  }
                  ${isCurrent ? 'outline outline-4 outline-brand-blue/20 outline-offset-0 border-brand-blue bg-brand-blue text-white' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="sm:text-center mt-2">
                <p className={`font-heading font-bold text-xl uppercase tracking-tight ${isCompleted ? 'text-brand-deep-blue' : 'text-brand-deep-blue/40'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mt-1">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
