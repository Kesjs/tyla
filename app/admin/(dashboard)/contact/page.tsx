import { createClient } from '@/lib/supabase/server';
import { ContactEditor } from '@/components/admin/ContactEditor';
import type { ContactInfo } from '@/lib/tickets';

export const revalidate = 0;

export default async function AdminContactPage() {
  const supabase = createClient();
  const { data } = await supabase.from('tyla_contact_info').select('*').eq('id', 1).single();

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-or">Gestion</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ivoire">Page Contact</h1>
      <p className="mt-2 font-body text-sm text-ivoire/50">
        Ces informations s&apos;affichent immédiatement sur la page /contact du site.
      </p>
      <div className="mt-10">
        <ContactEditor initial={data as ContactInfo} />
      </div>
    </div>
  );
}
