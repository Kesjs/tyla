/**
 * Types et fonctions pour la gestion des membres du comité
 */

export interface CommitteeMember {
  id?: number;
  initials: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  display_order: number;
  active: boolean;
}

export async function getCommitteeMembers(supabase: any): Promise<CommitteeMember[]> {
  try {
    const { data, error } = await supabase
      .from('tyla_committee_members')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data ?? []) as CommitteeMember[];
  } catch (error) {
    // Retourne tableau vide si la table n'existe pas encore
    return [];
  }
}

export async function createCommitteeMember(supabase: any, member: Omit<CommitteeMember, 'id'>): Promise<CommitteeMember> {
  const { data, error } = await supabase
    .from('tyla_committee_members')
    .insert(member)
    .select()
    .single();

  if (error) throw error;
  return data as CommitteeMember;
}

export async function updateCommitteeMember(supabase: any, id: number, member: Partial<CommitteeMember>): Promise<CommitteeMember> {
  const { data, error } = await supabase
    .from('tyla_committee_members')
    .update(member)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CommitteeMember;
}

export async function deleteCommitteeMember(supabase: any, id: number): Promise<void> {
  const { error } = await supabase
    .from('tyla_committee_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
}