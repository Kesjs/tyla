# T.Y.L.A — J'AFFIRME Fashion Week 2026

Site vitrine + billetterie complète pour l'événement J'AFFIRME (Cotonou, 24 octobre 2026).

## État actuel — TOUT est construit

✅ Accueil, Association, Événement, Contact (formulaire connecté à Supabase)
✅ Billetterie : sélection, formulaire acheteur, paiement Kkiapay, génération de billets avec QR code
✅ Admin : login sécurisé, dashboard stats, gestion des catégories de billets (CRUD), édition page Contact, suivi des commandes + check-in par code

## Installation

```bash
npm install
cp .env.local.example .env.local
```

Puis compléter `.env.local` :

1. **Supabase** : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont déjà remplis (projet déjà configuré avec les tables `tyla_*`)
2. **SUPABASE_SERVICE_ROLE_KEY** (⚠️ obligatoire pour que la billetterie fonctionne) : Dashboard Supabase → Project Settings → API → copier la clé `service_role`
3. **Kkiapay** : créer un compte sur [kkiapay.me](https://kkiapay.me), récupérer les clés sandbox pour tester, puis les clés production. Remplir `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY`, `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_SECRET`
   - ⚠️ Dans `components/billetterie/TicketSelector.tsx`, le widget est en mode `sandbox: true` — repasser à `false` une fois prêt pour la production

```bash
npm run dev
```

Le site est accessible sur http://localhost:3000

## Créer le compte admin

Le site n'a **qu'un seul compte admin**. Pour le créer :

1. Dashboard Supabase → Authentication → Users → **Add user**
2. Email : `benin@tylafrica.com`
3. Choisir un mot de passe fort, cocher "Auto Confirm User"
4. Se connecter sur `/admin/login` avec ces identifiants

## Déploiement

Le plus simple : pousser ce dossier sur un repo GitHub puis l'importer sur [Vercel](https://vercel.com) (gratuit), en renseignant les mêmes variables d'environnement dans les réglages du projet Vercel (Settings → Environment Variables).

## Structure

```
app/
  (site)/                    → Pages publiques (avec header/footer)
    page.tsx                 → Accueil
    association/page.tsx     → À propos, histoire, comité
    evenement/page.tsx       → Concept, programme, infos pratiques
    contact/page.tsx         → Formulaire + infos dynamiques
    billetterie/
      page.tsx                → Sélection & achat
      confirmation/page.tsx   → Billets + QR codes après paiement
  admin/
    login/page.tsx           → Connexion admin
    (dashboard)/             → Pages protégées (middleware.ts)
      page.tsx                → Dashboard & stats
      billets/page.tsx        → CRUD catégories de billets
      contact/page.tsx        → Édition page Contact
      commandes/page.tsx      → Liste commandes + check-in
  api/
    checkout/route.ts        → Création de commande (pending)
    confirm-payment/route.ts → Vérification Kkiapay + génération billets
    checkin/route.ts         → Validation d'un billet le jour J
components/
  Header.tsx, Footer.tsx, GoldFrame.tsx (élément signature), Reveal.tsx
  home/                      → Sections de la page d'accueil
  billetterie/               → Sélecteur de billets, carte billet + QR
  admin/                     → Navigation, gestion billets, contact, check-in
lib/
  supabase/                  → Clients (navigateur, serveur, admin/service_role)
  tickets.ts                 → Types & logique (prix early bird, places restantes)
  kkiapay.ts                 → Vérification transaction + génération code billet
middleware.ts                → Protection des routes /admin
```

## Numérotation des billets

Chaque catégorie a son propre **segment de numéros séquentiels**, sans chevauchement :
- VIP Prestige : VIP-0001 → VIP-0010
- VIP Gold : GLD-0101 → GLD-0140
- Standard : STD-0301 → STD-0450
- Étudiant : ETU-0601 → ETU-0700

Modifiable dans `/admin/billets` (préfixe + numéro de départ du segment par
catégorie). L'attribution des numéros est atomique côté base de données
(fonction `tyla_reserve_ticket_numbers`) : deux achats simultanés ne peuvent
jamais recevoir le même numéro.

## Base de données (Supabase, tables `tyla_*`)

- `tyla_ticket_categories` — catégories, prix, quotas, statut Early Bird
- `tyla_orders` — commandes (pending/paid/failed)
- `tyla_tickets` — billets individuels (1 par place, avec code unique pour le QR)
- `tyla_contact_info` — infos de contact éditables (ligne unique)
- `tyla_contact_messages` — messages reçus via le formulaire

## Notes importantes

- **Emails de confirmation** : pas encore branchés (aucun service d'email configuré). L'acheteur voit ses billets/QR codes immédiatement après paiement sur la page de confirmation — à compléter plus tard avec un service comme Resend si l'envoi par email est souhaité.
- **Mode sandbox Kkiapay** : à désactiver avant le lancement réel (voir ci-dessus).
