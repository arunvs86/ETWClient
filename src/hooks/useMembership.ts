import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";
import { getMyMembership, type Membership } from "@/lib/membership.api";

/**
 * Safe membership hook:
 * - Does NOT fetch when logged out (or while auth state is loading)
 * - No retry loops on 401
 */
export function useMembership() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const q = useQuery<Membership | undefined>({
    queryKey: ["me", "membership"],
    queryFn: async () => {
      const data = await getMyMembership();
      return data ?? undefined;
    },
    enabled: isAuthed && !authLoading, // only when signed in and auth ready
    retry: false,                      // avoid retrying 401s
    staleTime: 5_000,
  });

  const membership = q.data;
  const status = membership?.status;
  const isActive =
    status === "active" || status === "trialing"; // adjust if you consider trialing inactive

  return {
    membership,
    status,
    isActive,
    isLoading: q.isLoading && isAuthed, // report loading only when authed
    error: q.error,
  };
}

export type { Membership };
