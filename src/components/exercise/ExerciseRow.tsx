import { TargetBadge } from "./TargetBadge";
import { VideoEmbedClient } from "./VideoEmbedClient";
import { SetLoggerClient } from "./SetLoggerClient";
import { ExerciseHistoryClient } from "./ExerciseHistoryClient";
import { Clock } from "lucide-react";
import type { ExerciseLog, SessionSummary } from "@/lib/repositories/exercise-logs";

interface CatalogInfo {
  id: string;
  name: string;
  video_url: string | null;
  thumbnail_url: string | null;
}

interface Props {
  exerciseId: string;
  workoutId: string;
  name: string;
  catalog: CatalogInfo | null;
  targetRaw: string;
  targetType: string;
  sets?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  compact?: boolean;
  logs?: ExerciseLog[];
  history?: SessionSummary[];
}

export function ExerciseRow({
  exerciseId,
  workoutId,
  name,
  catalog,
  targetRaw,
  targetType,
  sets,
  restSeconds,
  notes,
  compact = false,
  logs = [],
  history = [],
}: Props) {
  const displayName = catalog?.name ?? name;
  const videoUrl = catalog?.video_url;
  const thumbnailUrl = catalog?.thumbnail_url;

  return (
    <div className={compact ? "py-2" : "py-3"}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug flex-1">{displayName}</p>
        <TargetBadge
          targetRaw={targetRaw}
          targetType={targetType}
          sets={compact ? undefined : sets}
          className="shrink-0"
        />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-1">
        {!compact && sets && (
          <span className="text-xs text-muted-foreground">{sets} series</span>
        )}
        {restSeconds != null && restSeconds > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {restSeconds}&quot;
          </span>
        )}
        {notes && (
          <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">
            {notes}
          </span>
        )}
      </div>

      {/* Video */}
      {videoUrl && (
        <VideoEmbedClient
          videoUrl={videoUrl}
          thumbnailUrl={thumbnailUrl}
          exerciseName={displayName}
        />
      )}

      {/* Historial de sesiones anteriores */}
      <ExerciseHistoryClient history={history} targetType={targetType} />

      {/* Logger de series */}
      <SetLoggerClient
        exerciseId={exerciseId}
        catalogId={catalog?.id ?? null}
        workoutId={workoutId}
        targetType={targetType}
        targetRaw={targetRaw}
        existingLogs={logs}
      />
    </div>
  );
}
