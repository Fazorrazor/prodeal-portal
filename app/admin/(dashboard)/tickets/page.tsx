import { Suspense } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createServer } from '../../../../lib/supabase/server';
import { TicketTableSkeleton } from '../../../../components/admin/TicketTableSkeleton';
import { TicketFilters } from '../../../../components/admin/TicketFilters';
import { TicketTable } from '../../../../components/admin/TicketTable';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function TicketsData({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = (await createServer()) as any;
  const statusFilter = searchParams.status || 'all';
  const searchFilter = searchParams.search || '';

  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('inquiries')
    .select(
      `
      id,
      tracking_uuid,
      status,
      created_at,
      contact_name,
      company_name,
      inquiry_payload,
      divisions (
        display_name
      ),
      staff_members (
        full_name
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (searchFilter) {
    const searchTerm = `%${searchFilter}%`;
    query = query.or(
      `tracking_uuid.ilike.${searchTerm},contact_name.ilike.${searchTerm},company_name.ilike.${searchTerm},contact_phone.ilike.${searchTerm}`
    );
  }

  const { data: inquiries, error, count } = await query;

  if (error) {
    throw new Error(`Supabase Error: ${error.message} | Details: ${error.details || error.hint}`);
  }

  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <TicketTable
      inquiries={inquiries || []}
      totalCount={count || 0}
      currentPage={page}
      totalPages={totalPages}
      currentStatus={statusFilter}
      currentSearch={searchFilter}
    />
  );
}

export default async function TicketListPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentSearch = searchParams.search || '';
  const currentStatus = searchParams.status || 'all';

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Segmented Status Filter */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A1628]">Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, triage, and quote incoming division requests.
          </p>
        </div>
        <div id="tour-ticket-filters">
          <TicketFilters currentStatus={currentStatus} />
        </div>
      </div>

      {/* Active Search Indicator */}
      {currentSearch && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-lg border border-slate-200/80 text-xs">
          <span className="text-slate-600">
            Filtering results for{' '}
            <strong className="font-semibold text-[#0A1628]">&ldquo;{currentSearch}&rdquo;</strong>
          </span>
          <Link
            href={currentStatus !== 'all' ? `/admin/tickets?status=${currentStatus}` : '/admin/tickets'}
            className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-[#0A1628] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </Link>
        </div>
      )}

      <DivisionErrorBoundary>
        <div id="tour-ticket-table">
          <Suspense fallback={<TicketTableSkeleton />}>
            <TicketsData searchParams={searchParams} />
          </Suspense>
        </div>
      </DivisionErrorBoundary>
    </div>
  );
}
