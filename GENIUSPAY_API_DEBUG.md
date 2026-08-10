# 🔍 Diagnostic API GeniusPay - Erreur 405

## Problème Identifié
L'endpoint `https://api.geniuspay.ci/v1/transactions/initiate` retourne **405 Method Not Allowed** avec l'en-tête:
```
allow: 'GET, HEAD'
```

Cela signifie que l'endpoint **n'accepte que les requêtes GET/HEAD**, pas POST.

## Causes Possibles

### 1. **L'URL est incorrecte**
L'endpoint réel de GeniusPay n'est peut-être pas `/v1/transactions/initiate`

### 2. **Les credentials ne sont pas valides**
Les clés de production n'authentifient pas correctement

### 3. **La méthode d'authentification est différente**
GeniusPay attend peut-être une autre forme d'authentification

## Solutions à Tester

### ✅ Option 1: Vérifier la documentation GeniusPay
1. Allez sur https://dashboard.geniuspay.ci/
2. Cherchez dans **Settings > API Documentation** ou **Developer Docs**
3. Trouvez l'endpoint exact pour initialiser un paiement
4. Vérifiez la méthode HTTP (GET/POST/PUT)
5. Copiez l'URL exacte de l'endpoint

### ✅ Option 2: Contacter le support GeniusPay
Email: support@geniuspay.ci ou via https://geniuspay.ci/support
- Demandez: "Quel est l'endpoint exact pour initialiser un paiement?"
- Demandez: "Quelle est la méthode HTTP correcte?"
- Demandez: "Comment s'authentifier (Bearer token vs autre)?"

### ✅ Option 3: Vérifier les informations de l'onboarding
Si vous avez reçu un email de GeniusPay après l'enregistrement, il contient peut-être:
- L'endpoint exact de l'API
- Un lien vers la documentation API
- Des exemples de code
- Les credentials corrects

### ✅ Option 4: Tester l'endpoint avec curl
```bash
# Tester avec GET
curl -X GET https://api.geniuspay.ci/v1/transactions/initiate \
  -H "Authorization: Bearer YOUR_API_KEY"

# Tester avec POST (notre méthode actuelle)
curl -X POST https://api.geniuspay.ci/v1/transactions/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "amount": 5000,
    "currency": "XOF",
    "description": "Test"
  }'
```

## Information sur le Headers
L'en-tête `x-routed-version: v1` indique que vous contactez bien la v1, mais:
- Le serveur est derrière Cloudflare (cf-cache-status)
- C'est un endpoint public (html error page générée)

## Une Fois que vous Avez l'URL Correcte

1. Mettez à jour `lib/geniuspay.ts` ligne ~60:
```typescript
const url = 'https://api.geniuspay.ci/v1/CORRECT_ENDPOINT_HERE';
```

2. Vérifiez la méthode HTTP:
```typescript
const res = await fetch(url, {
  method: 'POST', // ou 'GET' si nécessaire
  headers: { /* ... */ }
});
```

3. Testez à nouveau avec les clés production correctes

## Status Actuel
- ✅ Sandbox mode: Fonctionne (génère une session mock)
- ❌ Production mode: Endpoint API incorrecte
- ❌ Clés de production: À vérifier

---

**Prochaine étape:** Consultez la documentation GeniusPay officielle pour obtenir l'endpoint exact.
