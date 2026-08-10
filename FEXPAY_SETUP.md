# Configuration Fexpay

Ce guide vous aide à intégrer Fexpay dans l'application Tyla pour les paiements.

## 1. Créer un compte Fexpay

1. Allez sur https://fexpay.com
2. Créez un compte marchand (ou connectez-vous si vous avez déjà un compte)
3. Allez dans **Dashboard > Settings > API Keys**
4. Copiez vos clés:
   - **API Key** (clé d'API)
   - **API Secret** (clé secrète)
   - **Public Key** (clé publique, si disponible)

## 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet (copié de `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Puis remplissez les variables Fexpay:

```env
# Fexpay — à créer sur https://fexpay.com
FEXPAY_API_KEY=votre_api_key_ici
FEXPAY_API_SECRET=votre_api_secret_ici
NEXT_PUBLIC_FEXPAY_PUBLIC_KEY=votre_public_key_ici
```

⚠️ **Important:**
- `FEXPAY_API_KEY` et `FEXPAY_API_SECRET` ne doivent jamais être préfixés par `NEXT_PUBLIC_` (variables côté serveur uniquement)
- `NEXT_PUBLIC_FEXPAY_PUBLIC_KEY` peut être utilisée côté client si nécessaire

## 3. Architecture de l'intégration

### Flux de paiement
```
1. Utilisateur → /billetterie → Sélection + Formulaire
2. POST /api/checkout → Création commande (status: pending)
3. POST /api/fexpay/initiate → Redirection Fexpay
4. Utilisateur paie sur Fexpay
5. Callback → /billetterie/fexpay-callback
6. POST /api/confirm-payment → Vérification + Génération billets
7. /billetterie/confirmation → Affichage des billets
```

### Fichiers clés
- **`lib/fexpay.ts`** - Fonctions d'intégration Fexpay
- **`app/api/checkout/route.ts`** - Endpoint checkout
- **`app/api/fexpay/initiate/route.ts`** - Initialiser paiement
- **`app/api/confirm-payment/route.ts`** - Confirmer paiement
- **`app/api/webhook/fexpay/route.ts`** - Webhook notifications
- **`components/billetterie/TicketSelector.tsx`** - Composant achat
- **`app/(site)/billetterie/fexpay-callback/page.tsx`** - Callback après paiement

## 4. Endpoints API

### POST `/api/checkout`
Crée une commande Fexpay.

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

### POST `/api/fexpay/initiate`
Initialise une session de paiement Fexpay.

**Request:**
```json
{
  "amount": 50000,
  "currency": "XOF",
  "description": "Achat de billets TYLA",
  "customerEmail": "jean@example.com",
  "customerPhone": "+229 01 97 12 34 56",
  "externalReference": "order-uuid",
  "returnUrl": "https://yourdomain.com/billetterie/fexpay-callback?order=order-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://fexpay.com/pay/...",
  "sessionId": "session-uuid",
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

### POST `/api/webhook/fexpay`
Webhook pour recevoir les notifications de paiement.

**Configuration dans Fexpay Dashboard:**
- URL: `https://yourdomain.com/api/webhook/fexpay`
- Events: Payment Completed
- Signature: Validée via `x-fexpay-signature` (HMAC-SHA256)

## 5. Configuration Fexpay Dashboard

### Webhooks
1. Allez dans **Settings > Webhooks**
2. Cliquez sur **Add Webhook**
3. Entrez l'URL: `https://yourdomain.com/api/webhook/fexpay`
4. Sélectionnez les événements: **Payment Completed**
5. Copiez le **Webhook Secret**
6. Vérifiez que le secret correspond à `FEXPAY_API_SECRET`

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
- Utilisez les credentials Fexpay Sandbox pour tester

## 7. Variables d'environnement complètes

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === Fexpay ===
FEXPAY_API_KEY=your-fexpay-api-key
FEXPAY_API_SECRET=your-fexpay-api-secret
NEXT_PUBLIC_FEXPAY_PUBLIC_KEY=your-fexpay-public-key
```

## 8. Dépannage

| Erreur | Solution |
|--------|----------|
| FEXPAY_API_KEY not configured | Vérifiez que `.env.local` contient la clé |
| Signature invalide | Vérifiez que `FEXPAY_API_SECRET` est correct |
| Montant incohérent | Le montant reçu ne correspond pas à la commande |
| Webhook non reçu | Vérifiez l'URL dans Fexpay Dashboard |
| Billets non générés | Vérifiez les logs et la connexion Supabase |

## 9. Documentation

- **Fexpay Developers**: https://developers.fexpay.com
- **Fexpay Dashboard**: https://dashboard.fexpay.com
- **Support Fexpay**: https://fexpay.com/support

---

**Besoin d'aide?** Consultez la documentation Fexpay ou contactez leur support.


