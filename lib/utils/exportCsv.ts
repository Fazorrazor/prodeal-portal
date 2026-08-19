export interface CsvInquiryRow {
  id: string;
  tracking_uuid: string;
  contact_name: string;
  company_name?: string | null;
  status: string;
  division_name: string;
  created_at: string;
  item_summary?: string;
}

export function exportInquiriesToCsv(inquiries: CsvInquiryRow[], filename = 'prodeal-inquiries-export.csv') {
  if (!inquiries || inquiries.length === 0) {
    return false;
  }

  const headers = [
    'Tracking ID',
    'Date Received',
    'Status',
    'Division',
    'Contact Name',
    'Company',
    'RFQ Items / Summary',
    'System ID'
  ];

  const escapeCsv = (str: string | null | undefined) => {
    if (str === null || str === undefined) return '""';
    const escaped = String(str).replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = inquiries.map((item) => [
    escapeCsv(item.tracking_uuid ? item.tracking_uuid.substring(0, 8).toUpperCase() : ''),
    escapeCsv(item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''),
    escapeCsv(item.status.toUpperCase()),
    escapeCsv(item.division_name || 'General'),
    escapeCsv(item.contact_name),
    escapeCsv(item.company_name || 'N/A'),
    escapeCsv(item.item_summary || 'Standard Quote Request'),
    escapeCsv(item.id)
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
