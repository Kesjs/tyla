import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Client "admin" côté serveur uniquement — utilise la clé service_role qui
 * contourne les policies RLS. Ne JAMAIS importer ce fichier dans un composant
 * client ou l'exposer au navigateur.
 *
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * (Supabase Dashboard > Project Settings > API > service_role secret)
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
