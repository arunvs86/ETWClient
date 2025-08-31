export function StatusBadge({ status }: { status: "open"|"answered"|"closed"|"locked" }) {
    const map: Record<string,string> = {
      open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      answered: "bg-blue-50 text-blue-700 ring-blue-200",
      closed: "bg-gray-100 text-gray-700 ring-gray-200",
      locked: "bg-red-50 text-red-700 ring-red-200",
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ${map[status]}`}>{status}</span>;
  }
  