import { Suspense } from 'react';
import { createServer } from '../../../../lib/supabase/server';
import { TicketTableSkeleton } from '../../../../components/admin/TicketTableSkeleton';
import { TicketFilters } from '../../../../components/admin/TicketFilters';
import { TicketTable } from '../../../../components/admin/TicketTable';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function TicketsData({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const supabase = createServer() as any;
  const statusFilter = searchParams.status || 'all';
  const searchFilter = searchParams.search || '';
  
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('inquiries')
    .select(`
      id,
      tracking_uuid,
      status,
      created_at,
      contact_name,
      company_name,
      divisions (
        display_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (searchFilter) {
    const searchTerm = `%${searchFilter}%`;
    query = query.or(`tracking_uuid.ilike.${searchTerm},contact_name.ilike.${searchTerm},company_name.ilike.${searchTerm},contact_phone.ilike.${searchTerm}`);
  }

  const { data: inquiries, error, count } = await query;

  if (error) {
    throw new Error(`Supabase Error: ${error.message} | Details: ${error.details || error.hint}`);
  }

  const totalPages = count ? Math.ceil(count / limit) : 1;

  return <TicketTable 
    inquiries={inquiries || []} 
    currentPage={page} 
    totalPages={totalPages} 
    currentStatus={statusFilter}
    currentSearch={searchFilter}
  />;
}

export default function TicketListPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2 pb-6 relative">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">Ticket Master List</h1>
          <p className="text-brand-deep-blue/60 font-body text-sm">Manage all incoming division inquiries.</p>
        </div>
        <TicketFilters currentStatus={searchParams.status || 'all'} />
      </div>

      <DivisionErrorBoundary>
        <Suspense fallback={<TicketTableSkeleton />}>
          <TicketsData searchParams={searchParams} />
        </Suspense>
      </DivisionErrorBoundary>
    </div>
  );
}
