// src/pages/billing/SuccessPage.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SuccessPage() {
  const { search } = useLocation();
  const sessionId = new URLSearchParams(search).get('session_id') || '';
  const qc = useQueryClient();
  const navigate = useNavigate();

  const mSync = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/membership/sync', { sessionId });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'membership'] });
      await qc.invalidateQueries({ queryKey: ['me'] });
      navigate('/me/enrollments', { replace: true });
    }
  });

  useEffect(() => {
    if (sessionId) mSync.mutate();
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-semibold">Finishing up…</h1>
      <p className="mt-2 text-gray-600">Confirming your payment and activating membership.</p>
    </div>
  );
}
