# Configuration GeniusPay

Ce guide vous aide à intégrer GeniusPay dans l'application Tyla pour les paiements en Afrique de l'Ouest.

## 1. Créer un compte GeniusPay

1. Allez sur https://onboarding.geniuspay.ci/
2. Remplissez le formulaire d'inscription:
   - Informations personnelles
   - Informations du projet
   - Volume de transactions estimé
3. Validez votre compte
4. Recevez vos clés API par email

### Accéder au dashboard

1. Allez sur https://dashboard.geniuspay.ci/
2. Connectez-vous avec vos identifiants
3. Allez dans **Settings > API Keys**
4. Copiez vos clés

## 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet (copié de `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Puis remplissez les variables GeniusPay:

```env
# GeniusPay — à créer sur https://onboarding.geniuspay.ci
GENIUSPAY_API_KEY=votre_api_key_ici
GENIUSPAY_API_SECRET=votre_api_secret_ici
NEXT_PUBLIC_GENIUSPAY_PUBLIC_KEY=votre_public_key_ici
```

⚠️ **Important:**
- `GENIUSPAY_API_KEY` et `GENIUSPAY_API_SECRET` ne doivent jamais être préfixés par `NEXT_PUBLIC_` (variables côté serveur uniquement)
- Ne jamais exposer le secret au navigateur
- Ne pas commiter le `.env.local` sur Git

## 3. Architecture de l'intégration

**Endpoint API Correct:**
```
https://geniuspay.ci/api/v1/merchant
```

**Documentation API:**
```
https://geniuspay.ci/docs/api
```

```
1. Utilisateur → /billetterie → Sélection + Formulaire
2. POST /api/checkout → Création commande (status: pending)
3. POST /api/geniuspay/initiate → Redirection GeniusPay
4. Utilisateur paie sur GeniusPay (Mobile Money, Carte, Portefeuille)
5. Callback → /billetterie/geniuspay-callback
6. POST /api/confirm-payment → Vérification + Génération billets
7. /billetterie/confirmation → Affichage des billets
```

### Fichiers clés

- **`lib/geniuspay.ts`** - Fonctions d'intégration GeniusPay
- **`app/api/checkout/route.ts`** - Endpoint checkout
- **`app/api/geniuspay/initiate/route.ts`** - Initialiser paiement
- **`app/api/confirm-payment/route.ts`** - Confirmer paiement
- **`app/api/webhook/geniuspay/route.ts`** - Webhook notifications
- **`components/billetterie/TicketSelector.tsx`** - Composant achat
- **`app/(site)/billetterie/geniuspay-callback/page.tsx`** - Callback après paiement

## 4. Endpoints API

### POST `/api/checkout`
Crée une commande GeniusPay.

**Request:**
```json
{
  "categoryId": "uuid",
  "quantity": 2,
  "buyerName": "Jean Dupont",
  "buyerPhone": "+229 01 97 12 34 56",
  "buyerEmail": "jean@example.com"
}
```

**Response:**
```json
{
  "orderId": "order-uuid",
  "amount": 50000,
  "categoryName": "VIP"
}
```

### POST `/api/geniuspay/initiate`
Initialise une session de paiement GeniusPay.

**Request:**
```json
{
  "amount": 50000,
  "currency": "XOF",
  "description": "Achat de billets TYLA",
  "customerEmail": "jean@example.com",
  "customerPhone": "+229 01 97 12 34 56",
  "externalReference": "order-uuid",
  "returnUrl": "https://yourdomain.com/billetterie/geniuspay-callback?order=order-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://pay.geniuspay.ci/...",
  "checkoutId": "checkout-uuid",
  "expiresAt": "2026-08-10T18:30:00Z",
  "transactionId": "txn-uuid"
}
```

### POST `/api/confirm-payment`
Confirme le paiement et génère les billets.

**Request:**
```json
{
  "orderId": "order-uuid",
  "transactionId": "txn-uuid"
}
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket-uuid",
      "ticket_code": "JAF-VIP-0001",
      "buyer_name": "Jean Dupont",
      "buyer_email": "jean@example.com",
      "category_id": "uuid",
      "ticket_number": 1
    }
  ]
}
```

### POST `/api/webhook/geniuspay`
Webhook pour recevoir les notifications de paiement.

**Configuration dans GeniusPay Dashboard:**
- URL: `https://yourdomain.com/api/webhook/geniuspay`
- Events: Payment Completed
- Signature: Validée via `x-geniuspay-signature` (HMAC-SHA256)

## 5. Configuration GeniusPay Dashboard

### Webhooks

1. Allez dans **Settings > Webhooks**
2. Cliquez sur **Add Webhook**
3. Entrez l'URL: `https://yourdomain.com/api/webhook/geniuspay`
4. Sélectionnez les événements: **Payment Completed**
5. Copiez le **Webhook Secret**
6. Vérifiez que le secret correspond à `GENIUSPAY_API_SECRET`

### Modes

- **Sandbox** (développement): testez les paiements sans frais
- **Production** (live): paiements réels

## 6. Vérifier l'intégration

Pour tester en développement:

```bash
npm run dev
```

Puis visitez:
- Page de billetterie: http://localhost:3000/billetterie
- Sélectionnez une catégorie et complétez le paiement
- Utilisez les credentials GeniusPay Sandbox pour tester

## 7. Variables d'environnement complètes

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === GeniusPay ===
GENIUSPAY_API_KEY=your-geniuspay-api-key
GENIUSPAY_API_SECRET=your-geniuspay-api-secret
NEXT_PUBLIC_GENIUSPAY_PUBLIC_KEY=your-geniuspay-public-key
```

## 8. Dépannage

| Erreur | Solution |
|--------|----------|
| GENIUSPAY_API_KEY not configured | Vérifiez que `.env.local` contient la clé |
| Signature invalide | Vérifiez que `GENIUSPAY_API_SECRET` est correct |
| Montant incohérent | Le montant reçu ne correspond pas à la commande |
| Webhook non reçu | Vérifiez l'URL dans GeniusPay Dashboard |
| Billets non générés | Vérifiez les logs et la connexion Supabase |

## 9. Méthodes de paiement supportées

GeniusPay supporte les méthodes suivantes en Afrique de l'Ouest:

- **Mobile Money** (Orange Money, MTN Mobile Money, Moov Money, etc.)
- **Carte bancaire** (Visa, Mastercard)
- **Portefeuille numérique** (disponible selon le pays)

## 10. Documentation

- **GeniusPay Onboarding**: https://onboarding.geniuspay.ci/
- **GeniusPay Dashboard**: https://dashboard.geniuspay.ci/
- **Support GeniusPay**: https://geniuspay.ci/support

---

**Besoin d'aide?** Consultez la documentation GeniusPay ou contactez leur support.
