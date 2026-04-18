import { createClient } from "@supabase/supabase-js";
// Database types are used for documentation; supabase gen types will replace types.ts
// with proper relation inference. Until then we use untyped client + explicit repo types.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Database } from "./types";

/**
 * Cliente para Server Components y Server Actions.
 * Usa la anon key — las políticas RLS permiten lectura de todos los datos
 * del entrenamiento sin autenticación.
 *
 * Para operaciones de escritura desde el servidor (Fase 3), usar el cliente
 * admin con service_role key en una Server Action separada.
 */
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.",
    );
  }

  return createClient(url, key);
}

/**
 * Cliente admin con service_role key para operaciones de escritura
 * (marcar entrenamientos como completados, guardar series, etc.)
 * Solo usar desde Server Actions — NUNCA exponer en el cliente.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
