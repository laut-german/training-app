"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  description: string;
}

const PREVIEW_LINES = 3;

export function WorkoutDescriptionClient({ description }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <p
        className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${
          !expanded ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" /> Menos
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" /> Más
          </>
        )}
      </button>
    </div>
  );
}
