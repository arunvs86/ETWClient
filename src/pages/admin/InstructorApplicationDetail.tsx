import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMemo, useState ,useEffect} from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  useInstructorApplication,
  approveInstructorApplication,
  rejectInstructorApplication,
  updateInstructorApplicationNotes,
} from '../../api/instructorApps';

export default function InstructorApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const mock = sp.get('mock') === '1';
  const backHref = `/admin/instructors/applications${mock ? '?mock=1' : ''}`;

  // Keep opts object stable so our query key stays stable
  const keyOpts = useMemo(() => ({ mock }), [mock]);
  const { data, isLoading, isError, error } = useInstructorApplication(id, keyOpts);

  const qc = useQueryClient();
  const detailKey = ['admin', 'instructor-application', id, keyOpts] as const;

  // Local notes state (editable)
  const [notesDraft, setNotesDraft] = useState<string>(() => ((data as any)?.notes ?? '') as string);
  // keep notes in sync when data loads/changes
  useEffect(() => {
    setNotesDraft(((data as any)?.notes ?? '') as string);
  }, [data]);

  // Approve
  const approveMut = useMutation({
    mutationFn: () => approveInstructorApplication(id!, { mock }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: detailKey });
      const prev = qc.getQueryData<any>(detailKey);
      qc.setQueryData<any>(detailKey, (old) => old ? { ...old, status: 'approved', rejectionReason: '' } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(detailKey, ctx.prev);
    },
    onSuccess: () => {
      // refresh lists and detail to be safe
      qc.invalidateQueries({ queryKey: ['admin', 'instructor-applications'] });
      qc.invalidateQueries({ queryKey: detailKey });
    },
  });

  // Reject
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const rejectMut = useMutation({
    mutationFn: (reason: string) => rejectInstructorApplication(id!, reason, { mock }),
    onMutate: async (reason) => {
      await qc.cancelQueries({ queryKey: detailKey });
      const prev = qc.getQueryData<any>(detailKey);
      qc.setQueryData<any>(detailKey, (old) => old ? { ...old, status: 'rejected', rejectionReason: reason } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(detailKey, ctx.prev);
    },
    onSuccess: () => {
      setShowReject(false);
      setRejectReason('');
      qc.invalidateQueries({ queryKey: ['admin', 'instructor-applications'] });
      qc.invalidateQueries({ queryKey: detailKey });
    },
  });

  // Notes save
  const notesMut = useMutation({
    mutationFn: (notes: string) => updateInstructorApplicationNotes(id!, notes, { mock }),
    onMutate: async (notes) => {
      await qc.cancelQueries({ queryKey: detailKey });
      const prev = qc.getQueryData<any>(detailKey);
      qc.setQueryData<any>(detailKey, (old) => old ? { ...old, notes } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(detailKey, ctx.prev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: detailKey });
    },
  });

  const name = data?.user?.name || '—';
  const email = data?.user?.email || '—';
  const statusRaw = (data?.status || '') as string;
  const status = statusRaw ? capitalize(statusRaw) : '—';
  const submitted = data?.createdAt ? formatDate(data.createdAt) : '—';
  const updated = data?.updatedAt ? formatDate(data.updatedAt) : '—';
  const rejectionReasonValue = (data as any)?.rejectionReason || '';

  const canAct = !isLoading && !isError && data && (data as any).status === 'pending';
  const isBusy = approveMut.isPending || rejectMut.isPending || notesMut.isPending;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Instructor Application</h1>
          <p className="text-xs text-gray-500">
            ID: <span className="font-mono">{id}</span> {mock && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5">mock</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`rounded border px-3 py-2 text-sm ${canAct ? 'border-gray-300 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed border-gray-300'}`}
            onClick={() => approveMut.mutate()}
            disabled={!canAct || approveMut.isPending}
            title={canAct ? 'Approve' : 'Approve (disabled unless pending)'}
          >
            {approveMut.isPending ? 'Approving…' : 'Approve'}
          </button>
          <button
            className={`rounded border px-3 py-2 text-sm ${canAct ? 'border-gray-300 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed border-gray-300'}`}
            onClick={() => setShowReject(true)}
            disabled={!canAct || rejectMut.isPending}
            title={canAct ? 'Reject' : 'Reject (disabled unless pending)'}
          >
            Reject
          </button>
          <Link to={backHref} className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            Back to list
          </Link>
        </div>
      </div>

      {/* Loading / Error / Not found */}
      {isLoading && <LoadingLayout />}
      {!isLoading && isError && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load application{(error as any)?.message ? `: ${(error as any).message}` : ''}.
        </div>
      )}
      {!isLoading && !isError && !data && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          Application not found.
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left: Applicant */}
          <Card title="Applicant" className="md:col-span-2">
            <Row label="Name" value={name} />
            <Row
              label="Email"
              value={email !== '—' ? <a className="underline" href={`mailto:${email}`}>{email}</a> : '—'}
            />
            <Row label="Profile" value="—" />
            <Row label="Notes (from applicant)" value={(data as any)?.applicantNotes || '—'} />
          </Card>

          {/* Right: Meta */}
          <Card title="Application">
            <Row label="Status" value={status} />
            <Row label="Submitted" value={submitted} />
            <Row label="Last updated" value={updated} />
            <Row label="Rejection reason" value={rejectionReasonValue || (statusRaw === 'rejected' ? '—' : '—')} />
          </Card>

          {/* Notes (editable) */}
          <Card title="Admin Notes" full>
            <textarea
              className="w-full min-h-[120px] rounded border border-gray-300 p-3 text-sm"
              placeholder="Add internal notes…"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              disabled={notesMut.isPending}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                onClick={() => notesMut.mutate(notesDraft)}
                disabled={notesMut.isPending || (data as any)?.notes === notesDraft}
              >
                {notesMut.isPending ? 'Saving…' : 'Save notes'}
              </button>
              {(data as any)?.notes !== notesDraft && !notesMut.isPending && (
                <span className="text-xs text-gray-500">Unsaved changes</span>
              )}
              {notesMut.isSuccess && <span className="text-xs text-green-700">Saved</span>}
            </div>
          </Card>
        </div>
      )}

      {/* Reject modal */}
      {showReject && (
        <Modal onClose={() => !rejectMut.isPending && setShowReject(false)}>
          <div className="mb-3 text-lg font-medium">Reject application</div>
          <label className="mb-2 block text-sm text-gray-700">Reason (required)</label>
          <textarea
            className="w-full min-h-[100px] rounded border border-gray-300 p-2 text-sm"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={rejectMut.isPending}
            placeholder="Explain why this application is being rejected…"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setShowReject(false)}
              disabled={rejectMut.isPending}
            >
              Cancel
            </button>
            <button
              className="rounded border border-red-400 text-red-700 px-3 py-1 text-sm hover:bg-red-50 disabled:opacity-50"
              onClick={() => {
                if (!rejectReason.trim()) return; // simple guard
                rejectMut.mutate(rejectReason.trim());
              }}
              disabled={rejectMut.isPending || !rejectReason.trim()}
            >
              {rejectMut.isPending ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- tiny helpers / subcomponents ---------- */

function LoadingLayout() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card title="Applicant"><SkeletonLines /></Card>
      <Card title="Application"><SkeletonLines /></Card>
      <Card title="Admin Notes" full>
        <textarea className="w-full min-h-[120px] rounded border border-gray-300 p-3 text-sm" placeholder="Loading…" readOnly />
      </Card>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded border border-gray-200 bg-white p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className = '',
  full = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  full?: boolean;
}) {
  return (
    <div className={`${full ? 'md:col-span-3' : ''} rounded border border-gray-200 bg-white ${className}`}>
      <div className="border-b border-gray-200 px-4 py-3 font-medium">{title}</div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-40 shrink-0 text-gray-500">{label}</div>
      <div className="flex-1 break-words">{value}</div>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>
  );
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return '—';
  }
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
