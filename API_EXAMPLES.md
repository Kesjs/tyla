# Exemples d'API Fexpay et Checkout

## 🧪 Tests avec curl

### 1. POST `/api/checkout` - Créer une commande avec Fexpay

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 2,
    "buyerName": "Jean Dupont",
    "buyerPhone": "+229 01 97 12 34 56",
    "buyerEmail": "jean@example.com",
    "paymentProvider": "fexpay"
  }'
```

**Réponse:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 50000,
  "categoryName": "VIP",
  "paymentProvider": "fexpay"
}
```

---

### 2. POST `/api/checkout` - Créer une commande avec KKiapay

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 1,
    "buyerName": "Marie Dupont",
    "buyerPhone": "+229 01 90 00 11 22",
    "buyerEmail": "marie@example.com",
    "paymentProvider": "kkiapay"
  }'
```

**Réponse:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 25000,
  "categoryName": "Standard",
  "paymentProvider": "kkiapay"
}
```

---

### 3. POST `/api/fexpay/initiate` - Initialiser un paiement Fexpay

```bash
curl -X POST http://localhost:3000/api/fexpay/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "XOF",
    "description": "Achat de 2 billets TYLA VIP",
    "customerEmail": "jean@example.com",
    "customerPhone": "+229 01 97 12 34 56",
    "externalReference": "550e8400-e29b-41d4-a716-446655440001",
    "returnUrl": "http://localhost:3000/billetterie/fexpay-callback?order=550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "paymentUrl": "https://api.fexpay.com/pay/session-uuid-...",
  "sessionId": "session_123456789",
  "expiresAt": "2026-08-10T18:30:00Z",
  "transactionId": "txn_9876543210"
}
```

---

### 4. POST `/api/confirm-payment-fexpay` - Confirmer un paiement Fexpay

```bash
curl -X POST http://localhost:3000/api/confirm-payment-fexpay \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "transactionId": "txn_9876543210"
  }'
```

**Réponse (succès):**
```json
{
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "ticket_code": "JAF-VIP-0001",
      "buyer_name": "Jean Dupont",
      "buyer_email": "jean@example.com",
      "category_id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_number": 1
    },
    {
      "id": "ticket-uuid-2",
      "ticket_code": "JAF-VIP-0002",
      "buyer_name": "Jean Dupont",
      "buyer_email": "jean@example.com",
      "category_id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_number": 2
    }
  ]
}
```

**Réponse (erreur):**
```json
{
  "error": "Le paiement n'a pas été confirmé."
}
```

---

### 5. POST `/api/confirm-payment` - Confirmer un paiement KKiapay

```bash
curl -X POST http://localhost:3000/api/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440002",
    "transactionId": "kkiapay-txn-uuid"
  }'
```

**Réponse:**
```json
{
  "tickets": [
    {
      "id": "ticket-uuid-3",
      "ticket_code": "JAF-STANDARD-0001",
      "buyer_name": "Marie Dupont",
      "buyer_email": "marie@example.com",
      "category_id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_number": 1
    }
  ]
}
```

---

### 6. POST `/api/webhook/fexpay` - Webhook de notification Fexpay

```bash
# Créer un payload de test
PAYLOAD='{"event":"payment.completed","transaction_id":"txn_9876543210","status":"completed","amount":50000,"currency":"XOF","timestamp":'$(date +%s)',"external_reference":"550e8400-e29b-41d4-a716-446655440001"}'

# Générer la signature HMAC-SHA256
# Remplacer SECRET_KEY par votre FEXPAY_API_SECRET
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "your_fexpay_api_secret" -hex | cut -d' ' -f2)

# Envoyer le webhook
curl -X POST http://localhost:3000/api/webhook/fexpay \
  -H "Content-Type: application/json" \
  -H "x-fexpay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Réponse:**
```json
{
  "success": true,
  "transactionId": "txn_9876543210"
}
```

---

## 🔐 Variables d'environnement pour les tests

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY=...
KKIAPAY_PRIVATE_KEY=...
KKIAPAY_SECRET=...

FEXPAY_API_KEY=your-sandbox-api-key
FEXPAY_API_SECRET=your-sandbox-api-secret
NEXT_PUBLIC_FEXPAY_PUBLIC_KEY=your-sandbox-public-key
```

---

## 🧩 Flux de test complet (Fexpay)

### Étape 1: Créer une commande
```bash
# Récupérer l'ID d'une catégorie depuis /billetterie
CATEGORY_ID="550e8400-e29b-41d4-a716-446655440000"
ORDER=$(curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": \"$CATEGORY_ID\",
    \"quantity\": 1,
    \"buyerName\": \"Test User\",
    \"buyerPhone\": \"+229 01 97 00 00 00\",
    \"buyerEmail\": \"test@example.com\",
    \"paymentProvider\": \"fexpay\"
  }")

ORDER_ID=$(echo $ORDER | jq -r '.orderId')
AMOUNT=$(echo $ORDER | jq -r '.amount')
echo "Commande créée: $ORDER_ID, Montant: $AMOUNT"
```

### Étape 2: Initialiser le paiement Fexpay
```bash
INIT=$(curl -s -X POST http://localhost:3000/api/fexpay/initiate \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT,
    \"currency\": \"XOF\",
    \"description\": \"Test de paiement\",
    \"customerEmail\": \"test@example.com\",
    \"customerPhone\": \"+229 01 97 00 00 00\",
    \"externalReference\": \"$ORDER_ID\",
    \"returnUrl\": \"http://localhost:3000/billetterie/fexpay-callback?order=$ORDER_ID\"
  }")

PAYMENT_URL=$(echo $INIT | jq -r '.paymentUrl')
TXN_ID=$(echo $INIT | jq -r '.transactionId')
echo "URL de paiement: $PAYMENT_URL"
echo "ID transaction: $TXN_ID"
```

### Étape 3: (Manuel) Aller sur la page Fexpay et payer

### Étape 4: Confirmer le paiement
```bash
CONFIRM=$(curl -s -X POST http://localhost:3000/api/confirm-payment-fexpay \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"transactionId\": \"$TXN_ID\"
  }")

TICKETS=$(echo $CONFIRM | jq -r '.tickets | length')
echo "Billets générés: $TICKETS"
echo $CONFIRM | jq '.tickets[0]'
```

### Étape 5: Visiter la page de confirmation
```bash
echo "Allez sur: http://localhost:3000/billetterie/confirmation?order=$ORDER_ID"
```

---

## 📊 Codes de réponse HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | ✅ Succès | Commande créée, paiement confirmé |
| 400 | ❌ Requête invalide | Paramètres manquants ou invalides |
| 401 | 🔒 Non autorisé | Signature webhook invalide |
| 402 | ❌ Paiement échoué | Paiement non confirmé ou montant invalide |
| 404 | ❌ Non trouvé | Commande ou catégorie introuvable |
| 429 | ⏱️ Rate limit | Trop de tentatives |
| 500 | 💥 Erreur serveur | Erreur interne du serveur |
| 502 | 🌐 Gateway error | Indisponibilité de Fexpay/KKiapay |

---

## 🐍 Python - Client de test

```python
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/api"

class FexpayTestClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
    
    def checkout(self, category_id, quantity=1, payment_provider="fexpay"):
        """Créer une commande"""
        response = self.session.post(f"{self.base_url}/checkout", json={
            "categoryId": category_id,
            "quantity": quantity,
            "buyerName": "Test User",
            "buyerPhone": "+229 01 97 00 00 00",
            "buyerEmail": "test@example.com",
            "paymentProvider": payment_provider
        })
        return response.json()
    
    def initiate_payment(self, amount, order_id):
        """Initialiser un paiement Fexpay"""
        response = self.session.post(f"{self.base_url}/fexpay/initiate", json={
            "amount": amount,
            "currency": "XOF",
            "description": "Test Payment",
            "customerEmail": "test@example.com",
            "customerPhone": "+229 01 97 00 00 00",
            "externalReference": order_id,
            "returnUrl": f"http://localhost:3000/billetterie/fexpay-callback?order={order_id}"
        })
        return response.json()
    
    def confirm_payment(self, order_id, transaction_id):
        """Confirmer un paiement Fexpay"""
        response = self.session.post(f"{self.base_url}/confirm-payment-fexpay", json={
            "orderId": order_id,
            "transactionId": transaction_id
        })
        return response.json()

# Usage
client = FexpayTestClient()

# Créer une commande
order = client.checkout(category_id="550e8400-e29b-41d4-a716-446655440000")
print(f"Order ID: {order['orderId']}")

# Initialiser le paiement
payment = client.initiate_payment(order['amount'], order['orderId'])
print(f"Payment URL: {payment['paymentUrl']}")

# Confirmer le paiement (après succès sur Fexpay)
result = client.confirm_payment(order['orderId'], payment['transactionId'])
print(f"Tickets: {len(result['tickets'])}")
```

---

## 🔗 Ressources utiles

- [Fexpay API Docs](https://developers.fexpay.com/api)
- [curl Documentation](https://curl.se/docs/)
- [jq Documentation](https://stedolan.github.io/jq/)
- [Postman (GUI pour tester les APIs)](https://www.postman.com/)

---

**Dernière mise à jour:** Août 2026
