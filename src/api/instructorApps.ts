import { useQuery } from '@tanstack/react-query';
// Adjust this import to your axios instance path if different:
import {api} from '@/lib/api';

function coerceId(it: any, fallback: string) {
    return it?._id ?? it?.id ?? it?.applicationId ?? it?.uuid ?? fallback;
  }

export type InstructorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface InstructorUser {
  _id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface InstructorApplication {
  _id: string;
  user: InstructorUser;
  status: InstructorApplicationStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  rejectionReason?: string;
  [key: string]: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type ListParams = {
  status?: InstructorApplicationStatus;
  q?: string;
  page?: number;   // 1-based
  limit?: number;  // page size
  mock?: boolean;  // local mock fallback
};

// Simple normalizer so we’re tolerant to slight backend shape differences
function normalizePaginated<T>(payload: any, fallback: Required<Pick<ListParams,'page'|'limit'>>): Paginated<T> {
  const raw = (payload?.items ?? payload?.data ?? []) as any[];
  const items = raw.map((it, idx) => {
    const _id = coerceId(it, `idx-${idx}`);
    return { _id, ...it };
  }) as T[];
  const total = Number(payload?.total ?? payload?.count ?? items.length);
  const page = Number(payload?.page ?? fallback.page);
  const limit = Number(payload?.limit ?? payload?.pageSize ?? fallback.limit);
  return { items, total, page, limit };
}

const MOCK_DATA: Paginated<InstructorApplication> = {
  items: Array.from({ length: 8 }).map((_, i) => ({
    _id: `mock-${i+1}`,
    status: (['pending','approved','rejected'] as const)[i % 3],
    user: {
      _id: `u-${i+1}`,
      name: ['Ava Singh','Noah Khan','Mia Patel','Ethan Li','Liam Ahmed','Sophia Chen','Oliver Jones','Isla Brown'][i],
      email: `applicant${i+1}@example.com`,
    },
    createdAt: new Date(Date.now() - i*86400000).toISOString(),
    updatedAt: new Date(Date.now() - i*86400000).toISOString(),
    notes: i % 2 === 0 ? 'Keen on teaching JS.' : '',
  })),
  total: 8,
  page: 1,
  limit: 10,
};

export async function fetchInstructorApplications(params: ListParams): Promise<Paginated<InstructorApplication>> {
  const { mock, ...rest } = params;
  if (mock) {
    // tiny delay to simulate network
    return new Promise((res) => setTimeout(() => res(MOCK_DATA), 250));
  }
  const res = await api.get('/admin/instructor-applications', { params: rest });
  return normalizePaginated<InstructorApplication>(res.data, {
    page: rest.page ?? 1,
    limit: rest.limit ?? 10,
  });
}

export function useInstructorApplications(params: ListParams) {
  return useQuery({
    queryKey: ['admin','instructor-applications', params],
    queryFn: () => fetchInstructorApplications(params),
    keepPreviousData: true,
    staleTime: 30_000,
  });
}

type OneOpts = { mock?: boolean };

function unwrapOne(root: any) {
    if (!root) return null;
    // handle shapes like { data: {...} }, { item: {...} }, { application: {...} }, { result: {...} }, { payload: {...} }
    return root.data ?? root.item ?? root.application ?? root.result ?? root.payload ?? root;
  }

function normalizeOne(payload: any) {
    if (!payload) return null;
    const _id = coerceId(payload, 'unknown');
  
    // tolerate alternate field names
    const rawUser =
      payload.user ??
      payload.applicant ??
      payload.owner ??
      payload.requester ??
      {};
  
    const statusRaw = (payload.status ?? 'pending') as string;
    const status = ['pending','approved','rejected'].includes(statusRaw.toLowerCase())
      ? (statusRaw.toLowerCase() as 'pending'|'approved'|'rejected')
      : 'pending';
  
    const createdAt = payload.createdAt ?? payload.created_at ?? payload.created ?? null;
    const updatedAt = payload.updatedAt ?? payload.updated_at ?? payload.updated ?? null;
  
    const notes =
      payload.notes ??
      payload.adminNotes ??
      payload.internalNotes ??
      '';
  
    const rejectionReason =
      payload.rejectionReason ??
      payload.reason ??
      payload.rejectedReason ??
      '';
  
    const applicantNotes =
      payload.applicantNotes ??
      payload.applicationNotes ??
      payload.message ??
      payload.statement ??
      payload.note ??
      '';
  
    return {
      _id,
      user: rawUser,
      status,
      createdAt,
      updatedAt,
      notes,
      rejectionReason,
      applicantNotes,
      ...payload, // keep original fields in case UI wants extras
    };
  }
  
  const MOCK_DETAIL_LIST = [
    {
      _id: 'mock-1',
      status: 'pending',
      user: { _id: 'u-1', name: 'Ava Singh', email: 'applicant1@example.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
      rejectionReason: '',
      applicantNotes: 'I want to teach modern JS and TS.',
    },
  ];
  
  export async function fetchInstructorApplication(id: string, opts: OneOpts = {}) {
    const { mock } = opts;
    if (mock) {
      const found = MOCK_DETAIL_LIST.find((x) => x._id === id) ?? null;
      return new Promise((res) =>
        setTimeout(() => res(found ? normalizeOne(found) : null), 250)
      );
    }
    const res = await api.get(`/admin/instructor-applications/${id}`);
    const body = unwrapOne(res.data);
    return normalizeOne(body);
  }
  
  export function useInstructorApplication(id: string | undefined, opts: OneOpts = {}) {
    return useQuery({
      queryKey: ['admin', 'instructor-application', id, opts],
      queryFn: () => (id ? fetchInstructorApplication(id, opts) : Promise.resolve(null)),
      enabled: !!id,
      staleTime: 30_000,
    });
  }


  type MutOpts = { mock?: boolean };

export async function approveInstructorApplication(id: string, opts: MutOpts = {}) {
  if (opts.mock) {
    return new Promise((res) => setTimeout(() => res({ ok: true, status: 'approved' }), 300));
  }
  const res = await api.post(`/admin/instructor-applications/${id}/approve`);
  return res.data;
}

export async function rejectInstructorApplication(id: string, reason: string, opts: MutOpts = {}) {
  if (opts.mock) {
    return new Promise((res) =>
      setTimeout(() => res({ ok: true, status: 'rejected', reason }), 300)
    );
  }
  const res = await api.post(`/admin/instructor-applications/${id}/reject`, { reason });
  return res.data;
}

export async function updateInstructorApplicationNotes(id: string, notes: string, opts: MutOpts = {}) {
  if (opts.mock) {
    return new Promise((res) => setTimeout(() => res({ ok: true, notes }), 300));
  }
  const res = await api.patch(`/admin/instructor-applications/${id}/notes`, { notes });
  return res.data;
}