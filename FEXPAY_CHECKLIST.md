# ✅ Fexpay Configuration Checklist

## 📋 Configuration initiale

### Compte Fexpay
- [ ] Créer un compte sur https://fexpay.com
- [ ] Vérifier l'email de confirmation
- [ ] Accéder au dashboard: https://dashboard.fexpay.com
- [ ] Activer le mode Sandbox pour les tests

### Récupération des credentials
- [ ] Aller dans **Settings > API Keys**
- [ ] Copier **API Key**
- [ ] Copier **API Secret**
- [ ] Copier **Public Key** (si disponible)
- [ ] Vérifier que les clés sont dans le bon mode (Sandbox/Production)

### Variables d'environnement
- [ ] Créer `.env.local` (ou copier `.env.local.example`)
- [ ] Ajouter `FEXPAY_API_KEY=<your-api-key>`
- [ ] Ajouter `FEXPAY_API_SECRET=<your-api-secret>`
- [ ] Ajouter `NEXT_PUBLIC_FEXPAY_PUBLIC_KEY=<your-public-key>`
- [ ] Vérifier que `.env.local` n'est pas commité (vérifier `.gitignore`)

### Base de données
- [ ] Vérifier que les colonnes existent sur `tyla_orders`:
  - `payment_provider` (text)
  - `payment_transaction_id` (text)
  - `payment_raw_response` (jsonb)
- [ ] Si manquantes, exécuter la migration SQL:
  ```sql
  ALTER TABLE tyla_orders 
  ADD COLUMN payment_provider text DEFAULT 'kkiapay',
  ADD COLUMN payment_transaction_id text,
  ADD COLUMN payment_raw_response jsonb;
  ```

---

## 🔧 Configuration Fexpay Dashboard

### Webhooks
- [ ] Aller dans **Settings > Webhooks**
- [ ] Cliquer sur **Add Webhook**
- [ ] Entrer l'URL: `https://yourdomain.com/api/webhook/fexpay`
- [ ] Sélectionner les événements: **Payment Completed**
- [ ] Copier le **Webhook Secret**
- [ ] Vérifier que le secret correspond à `FEXPAY_API_SECRET`
- [ ] Tester le webhook (utiliser le bouton "Test" du dashboard)

### Paramètres de paiement
- [ ] Vérifier la **devise par défaut** (XOF pour le Bénin)
- [ ] Configurer les **montants min/max** autorisés
- [ ] Activer les **méthodes de paiement**:
  - [ ] Carte bancaire
  - [ ] Mobile Money
  - [ ] Portefeuille numérique

### Paramètres de redirection
- [ ] Configurer l'**URL de succès** (callback)
- [ ] Configurer l'**URL d'erreur**
- [ ] Vérifier les **URLs de retour**

---

## 💻 Installation & Déploiement

### Code
- [ ] Vérifier que tous les fichiers ont été créés:
  ```
  app/api/fexpay/initiate/route.ts
  app/api/confirm-payment-fexpay/route.ts
  app/api/webhook/fexpay/route.ts
  app/(site)/billetterie/fexpay-callback/page.tsx
  components/billetterie/PaymentMethodSelector.tsx
  lib/fexpay.ts
  lib/types/fexpay.ts
  lib/types/checkout.ts
  ```
- [ ] Vérifier que les fichiers ont été modifiés:
  ```
  app/api/checkout/route.ts
  components/billetterie/TicketSelector.tsx
  .env.local.example
  ```
- [ ] Exécuter `npm install` pour mettre à jour les dépendances
- [ ] Vérifier que le build passe: `npm run build`

### Tests locaux
- [ ] Démarrer le serveur: `npm run dev`
- [ ] Vérifier que http://localhost:3000/billetterie charge correctement
- [ ] Vérifier que le sélecteur de paiement s'affiche
- [ ] Tester avec un paiement fictif Fexpay Sandbox

---

## 🧪 Tests de paiement

### Test 1: Checkout avec Fexpay
- [ ] Aller sur `/billetterie`
- [ ] Sélectionner une catégorie
- [ ] Choisir une quantité
- [ ] Sélectionner **Fexpay** dans la liste
- [ ] Remplir le formulaire
- [ ] Cliquer "Payer"
- [ ] Être redirigé vers Fexpay (mode Sandbox)

### Test 2: Paiement réussi
- [ ] Utiliser les paramètres de test Fexpay Sandbox
- [ ] Compléter le paiement
- [ ] Être redirigé vers `/billetterie/fexpay-callback`
- [ ] Voir le message "Confirmation du paiement..."
- [ ] Être redirigé vers `/billetterie/confirmation`
- [ ] Voir les billets générés

### Test 3: Paiement échoué
- [ ] Recommencer le test 1
- [ ] Refuser le paiement sur Fexpay
- [ ] Voir le message d'erreur
- [ ] Pouvoir retourner en arrière

### Test 4: KKiapay toujours fonctionnel
- [ ] Refaire le test 1 mais choisir **KKiapay**
- [ ] Vérifier que le widget KKiapay s'ouvre
- [ ] Tester le paiement
- [ ] Vérifier que les billets se génèrent

---

## 🔐 Sécurité

### Variables d'environnement
- [ ] Vérifier que `.env.local` n'est pas en Git
- [ ] Vérifier que `FEXPAY_API_SECRET` n'est pas exposé au client
- [ ] Vérifier que `FEXPAY_API_KEY` n'est pas exposé au client
- [ ] Vérifier que les logs ne contiennent pas les secrets

### Validation & Sanitization
- [ ] Tester avec des entrées malveillantes:
  - [ ] SQL injection dans le nom
  - [ ] XSS dans l'email
  - [ ] Numéro invalide
  - [ ] Montant négatif
  - [ ] Quantité > 10
- [ ] Vérifier que les erreurs sont gérées correctement
- [ ] Vérifier que les montants sont validés

### Rate Limiting
- [ ] Faire plusieurs requêtes rapides
- [ ] Vérifier que rate limiting se déclenche (429)
- [ ] Vérifier que les logs enregistrent l'activité

### Signatures de webhook
- [ ] Tester avec une signature invalide
- [ ] Vérifier que la requête est rejetée (401)
- [ ] Vérifier que l'activité suspecte est loggée

---

## 📊 Monitoring & Logs

### Logs d'application
- [ ] Vérifier que les paiements réussis sont loggés
- [ ] Vérifier que les erreurs sont loggées
- [ ] Vérifier que les activités suspectes sont loggées
- [ ] Configurer un système de centralisation des logs (Sentry, LogRocket, etc.)

### Dashboard Fexpay
- [ ] Vérifier que les transactions apparaissent
- [ ] Vérifier les montants
- [ ] Vérifier les statuts
- [ ] Vérifier les données utilisateur

### Base de données
- [ ] Vérifier que les commandes sont créées
- [ ] Vérifier que `payment_provider` est enregistré
- [ ] Vérifier que `payment_transaction_id` est enregistré
- [ ] Vérifier que les billets sont générés

---

## 🚀 Production

### Avant le déploiement
- [ ] Tous les tests locaux passent
- [ ] Rate limiting testé
- [ ] Webhooks testés
- [ ] Signature webhook validée
- [ ] KKiapay toujours fonctionnel
- [ ] Pas de secrets en dur dans le code
- [ ] Pas de console.log() avec des données sensibles

### Déploiement
- [ ] Déployer le code
- [ ] Vérifier que les variables d'env sont définies
- [ ] Vérifier que la DB est migrée
- [ ] Tester un paiement complet
- [ ] Vérifier que les webhooks sont reçus

### Mode Production Fexpay
- [ ] Changer Fexpay du mode Sandbox au mode Production
- [ ] Mettre à jour les credentials (API Key, API Secret)
- [ ] Tester avec un paiement réel (montant faible)
- [ ] Vérifier que la transaction apparaît dans Fexpay

### Post-déploiement
- [ ] Monitorer les erreurs
- [ ] Vérifier que les paiements arrivent
- [ ] Vérifier que les billets se génèrent
- [ ] Configurer les alertes pour les erreurs
- [ ] Vérifier les performances

---

## 🐛 Troubleshooting

### Si les paiements échouent:
- [ ] Vérifier les logs Fexpay Dashboard
- [ ] Vérifier les logs d'application
- [ ] Vérifier que `FEXPAY_API_KEY` est correct
- [ ] Vérifier que `FEXPAY_API_SECRET` est correct
- [ ] Vérifier la connectivité réseau
- [ ] Contacter le support Fexpay

### Si les billets ne se génèrent pas:
- [ ] Vérifier les logs de `/api/confirm-payment-fexpay`
- [ ] Vérifier la connexion Supabase
- [ ] Vérifier que la table `tyla_orders` a les colonnes nécessaires
- [ ] Vérifier que la catégorie de billet existe
- [ ] Exécuter manuellement la confirmation via l'API

### Si le webhook ne fonctionne pas:
- [ ] Vérifier que l'URL est correcte dans Fexpay Dashboard
- [ ] Vérifier que le serveur est accessible externally
- [ ] Vérifier que le HTTPS est actif (production)
- [ ] Tester le webhook manuellement avec curl
- [ ] Vérifier les logs du serveur

### Si le rate limiting bloque les utilisateurs:
- [ ] Vérifier les paramètres `RATE_LIMITS` dans `lib/rate-limit.ts`
- [ ] Augmenter les limites si nécessaire
- [ ] Vérifier que les utilisateurs légitimes ne sont pas bloqués

---

## 📚 Documentation

- [ ] Lire `FEXPAY_SETUP.md` complètement
- [ ] Lire `INTEGRATION_SUMMARY.md` pour comprendre l'architecture
- [ ] Lire `API_EXAMPLES.md` pour les exemples
- [ ] Consulter [Fexpay Developers](https://developers.fexpay.com)

---

## ✨ Checklist finale

- [ ] Toutes les cases ci-dessus sont cochées
- [ ] Aucun secret en dur dans le code
- [ ] Build passe avec succès
- [ ] Tests locaux réussissent
- [ ] Webhooks testés
- [ ] Rate limiting testé
- [ ] KKiapay fonctionne toujours
- [ ] Logs en place
- [ ] Documentation complète
- [ ] Prêt pour la production ✅

---

**Notes supplémentaires:**
```
_________________________________
_________________________________
_________________________________
```

**Dernière mise à jour:** Août 2026  
**Version:** 1.0.0
