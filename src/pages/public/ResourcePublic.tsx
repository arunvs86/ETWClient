import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getResourceBySlug, type PublicResourceItem, createResourceCheckout, confirmResourcePurchase } from '@/lib/resources.api';
import Button from '@/components/ui/Button';

function formatPrice(amountMinor?: number, currency: 'GBP'|'USD'|'EUR' = 'GBP', isFree?: boolean) {
  if (isFree || !amountMinor) return 'Free';
  const amount = (amountMinor || 0) / 100;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); }
  catch { return `${amount.toFixed(2)} ${currency}`; }
}

export default function ResourcePublic() {
  const { slug = '' } = useParams();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['resource', slug],
    queryFn: () => getResourceBySlug(slug),
    enabled: !!slug,
  });

  // After Stripe redirect, confirm purchase then refetch
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const ok = sp.get('purchase') === 'success';
    const sid = sp.get('session_id');
    if (ok && sid) {
      confirmResourcePurchase(sid).finally(() => {
        // clean the URL and refresh the data
        const url = new URL(location.href);
        url.searchParams.delete('purchase');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
        refetch();
      });
    }
  }, [refetch]);

  const mCheckout = useMutation({
    mutationFn: async (resourceId: string) => {
      const { checkoutUrl } = await createResourceCheckout(resourceId);
      window.location.href = checkoutUrl;
      return null;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !data) return <div className="text-red-600">Resource not found.</div>;

  const { resource, items } = data;
  const isFree = (resource.pricing?.amountMinor ?? 0) === 0;
  const showItems = resource.unlocked || isFree;
  const priceLabel = formatPrice(resource.pricing?.amountMinor, resource.pricing?.currency || 'GBP', resource.pricing?.isFree);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{resource.title}</h1>

        {resource.description && (
          <div className="card p-4 prose max-w-none">
            <h3 className="font-medium mb-2">Overview</h3>
            <p className="text-gray-800 whitespace-pre-line">{resource.description}</p>
          </div>
        )}

        {showItems ? (
          items.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium mb-2">Resources</h3>
              <ul className="space-y-2">
                {items.map((it: PublicResourceItem) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{it.title}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {it.type === 'link' ? `🔗 ${it.link?.url}` : `📄 ${it.file?.fileName || it.file?.url}`}
                      </div>
                    </div>
                    {it.type === 'link' ? (
                      <a href={it.link?.url} target="_blank" rel="noreferrer" className="inline-flex">
                        <Button>Open</Button>
                      </a>
                    ) : (
                      <a href={it.file?.url} target="_blank" rel="noreferrer" className="inline-flex" download>
                        <Button>Download</Button>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : (
          <div className="card p-4">
            <h3 className="font-medium mb-2">What you’ll get</h3>
            <p className="text-sm text-gray-700">Purchase to unlock all files and links in this pack.</p>
          </div>
        )}
      </div>

      <aside className="card p-4 h-fit space-y-3">
        <div className="text-2xl font-bold text-primary">{priceLabel}</div>
        {resource.pricing?.includedInMembership && (
          <div className="text-xs text-green-700">Included with active membership</div>
        )}

        {!showItems && (
          <Button
            full
            onClick={() => mCheckout.mutate(String(resource.id || (resource as any)._id))}
            disabled={mCheckout.isPending}
          >
            {mCheckout.isPending ? 'Redirecting…' : 'Buy resource'}
          </Button>
        )}

        {showItems && !isFree && <div className="text-xs text-gray-600">You own this resource.</div>}

        {resource.category && <div className="text-sm text-gray-700">Category: <b>{resource.category}</b></div>}
        {/* {resource.thumbnail && <img src={resource.thumbnail} alt={resource.title} className="rounded-md" />} */}
        {resource.thumbnail && (
  <div className="rounded-md border shadow-sm bg-white flex items-center justify-center p-2">
    <img
      src={resource.thumbnail}
      alt={resource.title}
      className="max-h-80 w-auto object-contain"
      loading="lazy"
    />
  </div>
)}

      </aside>
    </div>
  );
}
