/**
 * Parser del campo `target` que viene del JSON de Harbiz.
 *
 * El `target` es un string libre muy variable:
 *   "8"          → 8 reps
 *   "8+8"        → 8 reps cada lado (alternado)
 *   "6-8"        → rango de reps
 *   "6-4-2"      → pirámide descendente
 *   "30\""       → 30 segundos
 *   "1'"         → 1 minuto
 *   "30m"        → 30 metros
 *   "15-20 por lado" → rango por lado
 *   ""           → sin target (ejercicios de técnica)
 *   "Max"        → al fallo
 *
 * El parser elige el input correcto en la UI de registro.
 */

export type TargetType =
  | "reps"
  | "reps_range"
  | "reps_paired"
  | "pyramid"
  | "time"
  | "time_range"
  | "distance"
  | "mixed";

export type TargetParsed =
  | { kind: "reps"; reps: number }
  | { kind: "reps_range"; min: number; max: number }
  | { kind: "reps_paired"; left: number; right: number; perSide?: boolean }
  | { kind: "reps_paired_range"; min: number; max: number; perSide: true }
  | { kind: "pyramid"; reps: number[] }
  | { kind: "time"; seconds: number }
  | { kind: "time_range"; minSec: number; maxSec: number }
  | { kind: "distance"; meters: number }
  | { kind: "mixed"; raw: string };

export interface ParsedTarget {
  type: TargetType;
  parsed: TargetParsed;
}

/**
 * Convierte una unidad de tiempo ("30\"" o "1'") a segundos.
 * " = segundos, ' = minutos.
 */
function timeTokenToSeconds(token: string): number | null {
  const mSec = /^(\d+)"$/.exec(token);
  if (mSec) return parseInt(mSec[1], 10);
  const mMin = /^(\d+)'$/.exec(token);
  if (mMin) return parseInt(mMin[1], 10) * 60;
  return null;
}

export function parseTarget(raw: string | null | undefined): ParsedTarget {
  const s = (raw ?? "").trim();

  if (s === "") {
    return { type: "mixed", parsed: { kind: "mixed", raw: "" } };
  }

  // 1. "por lado" — ejercicios unilaterales (reps * 2 lados)
  //    Ej: "15-20 por lado", "10-12 por lado"
  const perSideMatch = /^(\d+)(?:-(\d+))?\s+por\s+lado$/i.exec(s);
  if (perSideMatch) {
    const min = parseInt(perSideMatch[1], 10);
    const max = perSideMatch[2] ? parseInt(perSideMatch[2], 10) : min;
    if (min === max) {
      return {
        type: "reps_paired",
        parsed: { kind: "reps_paired", left: min, right: min, perSide: true },
      };
    }
    return {
      type: "reps_paired",
      parsed: { kind: "reps_paired_range", min, max, perSide: true },
    };
  }

  // 2. Distancia: "30m", "20m"
  const distMatch = /^(\d+)\s*m$/.exec(s);
  if (distMatch) {
    return {
      type: "distance",
      parsed: { kind: "distance", meters: parseInt(distMatch[1], 10) },
    };
  }

  // 3. Rango de tiempo: "20\"-40\""
  const timeRangeMatch = /^(\d+["'])-(\d+["'])$/.exec(s);
  if (timeRangeMatch) {
    const minSec = timeTokenToSeconds(timeRangeMatch[1]);
    const maxSec = timeTokenToSeconds(timeRangeMatch[2]);
    if (minSec !== null && maxSec !== null) {
      return {
        type: "time_range",
        parsed: { kind: "time_range", minSec, maxSec },
      };
    }
  }

  // 4. Tiempo simple: "30\"", "1'", "60\""
  const timeOne = timeTokenToSeconds(s);
  if (timeOne !== null) {
    return { type: "time", parsed: { kind: "time", seconds: timeOne } };
  }

  // 5. Pirámide: "6-4-2", "5-3-1"
  const pyramidMatch = /^(\d+)-(\d+)-(\d+)$/.exec(s);
  if (pyramidMatch) {
    return {
      type: "pyramid",
      parsed: {
        kind: "pyramid",
        reps: [
          parseInt(pyramidMatch[1], 10),
          parseInt(pyramidMatch[2], 10),
          parseInt(pyramidMatch[3], 10),
        ],
      },
    };
  }

  // 6. Reps pareadas simples: "8+8", "10+10"
  const pairedMatch = /^(\d+)\+(\d+)$/.exec(s);
  if (pairedMatch) {
    return {
      type: "reps_paired",
      parsed: {
        kind: "reps_paired",
        left: parseInt(pairedMatch[1], 10),
        right: parseInt(pairedMatch[2], 10),
      },
    };
  }

  // 7. Rango de reps: "6-8", "10-14"
  const rangeMatch = /^(\d+)-(\d+)$/.exec(s);
  if (rangeMatch) {
    return {
      type: "reps_range",
      parsed: {
        kind: "reps_range",
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10),
      },
    };
  }

  // 8. Reps simples: "8", "12"
  const repsMatch = /^(\d+)$/.exec(s);
  if (repsMatch) {
    return {
      type: "reps",
      parsed: { kind: "reps", reps: parseInt(repsMatch[1], 10) },
    };
  }

  // 9. Cualquier otra cosa ("Max", "30\"+30\"", etc.) → mixed con raw
  return { type: "mixed", parsed: { kind: "mixed", raw: s } };
}
