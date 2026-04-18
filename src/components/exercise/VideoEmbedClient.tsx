"use client";

import { useState } from "react";
import { PlayCircle, X } from "lucide-react";

interface Props {
  videoUrl: string;
  thumbnailUrl?: string | null;
  exerciseName: string;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?]+)/);
  return m ? m[1] : null;
}

export function VideoEmbedClient({ videoUrl, thumbnailUrl, exerciseName }: Props) {
  const [open, setOpen] = useState(false);
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) return null;

  const thumb = thumbnailUrl ?? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="relative w-16 h-10 rounded overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt={exerciseName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <span>Ver video</span>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-1 -right-1 z-10 bg-muted rounded-full p-0.5"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={exerciseName}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
