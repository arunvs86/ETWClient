// src/components/player/VideoPlayer.tsx
import React from 'react';

function isYouTube(u?: string) {
  if (!u) return false;
  try {
    const url = new URL(u);
    return /(^|\.)youtube\.com$/.test(url.hostname) || /(^|\.)youtu\.be$/.test(url.hostname);
  } catch { return false; }
}

function getYouTubeId(u: string): string | null {
  try {
    const url = new URL(u);
    if (/youtu\.be$/.test(url.hostname)) return url.pathname.slice(1);
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    const m = u.match(/\/embed\/([A-Za-z0-9_\-]{6,})/);
    return m ? m[1] : null;
  } catch { return null; }
}

export default function VideoPlayer({
  video,
  onEnded,
}: {
  video?: { provider?: 'youtube'|'s3'|'mux'|'cloudflare'; url?: string };
  onEnded?: () => void;
}) {
  const url = video?.url || '';
  const provider = (video?.provider || '') as string;

  const treatAsYouTube = provider === 'youtube' || isYouTube(url);

  if (treatAsYouTube) {
    const id = getYouTubeId(url);
    if (!id) return <div className="p-3 text-sm text-red-600">Invalid YouTube URL</div>;
    return (
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
        <iframe
          key={id}
          className="absolute inset-0 h-full w-full pointer-events-auto"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  // fallback: direct file (mp4, etc.)
  return (
    <video
      className="w-full rounded-lg bg-black"
      style={{ aspectRatio: '16/9' }}
      src={url}
      controls
      playsInline
      onEnded={() => onEnded?.()}
    />
  );
}
