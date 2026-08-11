'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { TicketSelector } from './TicketSelector';
import type { TicketCategory } from '@/lib/tickets';
import { Reveal } from '@/components/Reveal';

function ErrorFallback() {
  return (
    <Reveal className="mx-auto max-w-lg border-l-2 border-porto bg-porto/5 pl-4 py-3">
      <p className="font-body text-sm text-porto-light">
        Une erreur est survenue lors du chargement des billets.
      </p>
      <p className="mt-3 font-body text-xs text-ivoire/50">
        Contactez-nous à benin@tylafrica.com si le problème persiste.
      </p>
    </Reveal>
  );
}

export function TicketSelectorBoundary({
  categories,
  paymentCancelled,
}: {
  categories: TicketCategory[];
  paymentCancelled?: boolean;
}) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TicketSelector categories={categories} paymentCancelled={paymentCancelled} />
    </ErrorBoundary>
  );
}
