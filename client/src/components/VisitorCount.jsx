import { createContext, useContext, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { useTrackWebsiteVisitMutation } from '../store/slices/visitorsApiSlice';

const VisitorCountContext = createContext(null);

export const VisitorCountProvider = ({ children }) => {
  const hasRecordedVisit = useRef(false);
  const [trackVisit, { data }] = useTrackWebsiteVisitMutation();

  useEffect(() => {
    if (hasRecordedVisit.current) return;
    hasRecordedVisit.current = true;
    trackVisit();
  }, [trackVisit]);

  return (
    <VisitorCountContext.Provider value={data?.count ?? null}>
      {children}
    </VisitorCountContext.Provider>
  );
};

export const VisitorCount = ({ compact = false }) => {
  const visitorCount = useContext(VisitorCountContext);
  const countLabel = visitorCount === null ? '...' : visitorCount.toLocaleString('en-IN');

  return (
    <div
      aria-live="polite"
      aria-label={`${countLabel} website visits`}
      className={compact
        ? 'inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800'
        : 'mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm lg:mx-0'}
    >
      <Eye size={compact ? 15 : 17} aria-hidden="true" />
      <span>{countLabel}{compact && <span className="hidden sm:inline"> website visits</span>}</span>
    </div>
  );
};
