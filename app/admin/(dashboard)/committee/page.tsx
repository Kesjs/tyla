import { Reveal } from '@/components/Reveal';
import { CommitteeManager } from '@/components/admin/CommitteeManager';

export default function CommitteePage() {
  return (
    <div className="max-w-6xl">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold text-ivoire sm:text-4xl">
          Gestion du Comité
        </h1>
        <p className="mt-4 font-body text-sm text-ivoire/60">
          Ajoutez, modifiez ou supprimez les membres du comité avec leurs informations de contact
        </p>
      </Reveal>

      <div className="mt-8">
        <CommitteeManager />
      </div>
    </div>
  );
}